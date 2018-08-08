const config = require('./config');
const { AuthError, InputError } = require('./errors');
const Payment = require('./types/payment');
const Person = require('./types/person');
const { getKeyChecked } = require('./key');
const { mailTask } = require('./mail');
const { addPerson } = require('./people');
const { upgradePerson } = require('./upgrade');

class Purchase {
  constructor(pgp, db) {
    this.pgp = pgp;
    this.db = db;
    this.createInvoice = this.createInvoice.bind(this);
    this.getDaypassPrices = this.getDaypassPrices.bind(this);
    this.getPurchaseData = this.getPurchaseData.bind(this);
    this.getPurchases = this.getPurchases.bind(this);
    this.getStripeKeys = this.getStripeKeys.bind(this);
    this.handleStripeWebhook = this.handleStripeWebhook.bind(this);
    this.makeDaypassPurchase = this.makeDaypassPurchase.bind(this);
    this.makeMembershipPurchase = this.makeMembershipPurchase.bind(this);
    this.makeOtherPurchase = this.makeOtherPurchase.bind(this);
  }

  calcDaypassAmounts(passPeople) {
    return this.db.many(`SELECT * FROM daypass_amounts`)
      .then(amounts => {
        const amount = (person, day) => person.data[day]
          ? amounts.find(d => d.status === person.data.membership)[day]
          : 0
        const days = Object.keys(amounts[0]).filter(d => Number(amounts[0][d]) > 0)
        return passPeople.reduce((sum, person) => {
          person.passAmount = days.reduce((sum, day) => sum + amount(person, day), 0)
          return sum + person.passAmount
        }, 0)
      })
  }

  getDaypassPrices(req, res, next) {
    this.db.many(`SELECT * FROM daypass_amounts`)
      .then(amounts => res.json(
        amounts.reduce((map, row) => {
          map[row.status] = Object.assign(row, { status: undefined })
          return map
        }, {})
      ))
  }

  getPurchaseData(req, res, next) {
    this.db.many(`
      SELECT c.key, c.label, c.account, c.allow_create_account,
             c.listed, c.description, f.fields AS shape, t.types
        FROM payment_categories c
             LEFT JOIN payment_fields_by_category f USING (key)
             LEFT JOIN payment_types_by_category t USING (key)
    `)
      .then(rows => res.json(rows.reduce((data, row) => {
        data[row.key] = row
        delete row.key
        Object.keys(row)
          .filter(key => row[key] == null)
          .forEach(key => { delete row[key] })
        return data
      }, {})))
  }

  getStripeKeys(req, res, next) {
    const type = 'pk_' + process.env.STRIPE_SECRET_APIKEY.slice(3,7)
    this.db.any(`SELECT name, key FROM stripe_keys WHERE type = $1`, type)
      .then(data => res.json(data.reduce((keys, { name, key }) => {
        keys[name] = key
        return keys
      }, {})))
  }

  getPurchases(req, res, next) {
    let email = req.session.user.email
    if (req.session.user.member_admin) {
      if (req.query.email) {
        email = req.query.email
      } else if (req.query.all) {
        return this.db.any(`SELECT * FROM Payments`)
          .then(data => res.json(data))
      }
    }
    if (!email) return next(new AuthError())
    this.db.any(`
      SELECT *
        FROM Payments
       WHERE payment_email=$1 OR
             person_id IN (
               SELECT id FROM People WHERE email=$1
             )`, email)
      .then(data => res.json(data))
  }

  handleStripeWebhook(req, res, next) {
    const updated = new Date(req.body.created * 1000)
    const { id, object, status } = req.body.data.object
    if (isNaN(updated) || !id || !status || object !== 'charge') {
      res.status(400).end()
      console.error('Error: Unexpected Stripe webhook data', req.body)
    } else {
      this.db.any(`
           UPDATE payments
              SET updated=$(updated), status=$(status)
            WHERE stripe_charge_id=$(id) and status!=$(status)
        RETURNING *`, { id, status, updated }
      )
        .catch(() => res.status(500).end())
        .then(items => {
          res.status(200).end()
          return Promise.all(items.map(item => {
            console.log('Updated payment', item.id, 'status to', status);
            return this.db.one(`
              SELECT f.fields AS shape, t.types
                FROM payment_fields_by_category f
                     LEFT JOIN payment_types_by_category t USING (key)
               WHERE key = $1`, item.category
            )
              .then(({ shape, types }) => {
                const typeData = types.find(td => td.key === item.type);
                return mailTask('kansa-update-payment', Object.assign({
                  email: item.person_email || item.payment_email,
                  name: item.person_name || null,
                  shape,
                  typeLabel: typeData && typeData.label || item.type
                }, item));
              })
          }))
        })
    }
  }

  checkUpgrades(db, prices, reqUpgrades) {
    if (reqUpgrades.length === 0) return Promise.resolve([]);
    return db.any(`
      SELECT id, email, membership, preferred_name(p) as name, paper_pubs
        FROM People p
       WHERE id IN ($1:csv)`, [reqUpgrades.map(u => u.id)]
    ).then(prevData => {
      if (prevData.length !== reqUpgrades.length) throw new InputError(
        `Error in upgrades: found ${prevData.length} of ${reqUpgrades.length} memberships`
      );
      return reqUpgrades.map(upgrade => {
        const prev = prevData.find(m => m.id === upgrade.id);
        if (!prev || !prev.membership) throw new InputError(`Previous membership not found for ${JSON.stringify(upgrade)}`);
        if (!upgrade.membership || upgrade.membership === prev.membership) {
          delete upgrade.membership;
        } else if (prices[upgrade.membership] < prices[prev.membership]) {
          throw new InputError(
            `Can't upgrade from ${JSON.stringify(prev.membership)} to ${JSON.stringify(upgrade.membership)}`
          );
        }

        if (upgrade.paper_pubs) {
          if (!config.paid_paper_pubs) throw new InputError('Paper pubs are not a paid option, so cannot be a part of an upgrade')
          if (prev.paper_pubs) throw new InputError(`${JSON.stringify(upgrade)} already has paper pubs!`);
        } else if (!upgrade.membership) {
          throw new InputError(`Change in ${
            config.paid_paper_pubs ? 'at least one of membership and/or paper_pubs' : 'membership'
          } is required for upgrade`);
        }

        let amount = 0
        if (upgrade.membership) amount += (prices[upgrade.membership] || 0) - (prices[prev.membership] || 0)
        if (upgrade.paper_pubs) amount += prices.paper_pubs
        return Object.assign({}, upgrade, {
          amount,
          email: prev.email,
          name: prev.name,
          paper_pubs: Person.cleanPaperPubs(upgrade.paper_pubs),
          prev_membership: prev.membership
        });
      });
    });
  }

  getMembershipPaymentItems(prices, newMembers, upgrades) {
    const newMemberItems = newMembers.map(({ data }) => {
      const mp = prices[data.membership]
      if (typeof mp !== 'number' || mp < 0) {
        throw new InputError(`Membership type not available for purchase: ${JSON.stringify(data.membership)}`)
      }
      const pp = config.paid_paper_pubs && data.paper_pubs && prices.paper_pubs || 0
      return {
        amount: mp + pp,
        category: 'new_member',
        currency: 'eur',
        data,
        person_name: data.preferredName,
        type: data.membership
      }
    })
    const upgradeItems = upgrades.map(({ amount, id, membership, name, paper_pubs}) => ({
      amount,
      category: 'upgrade',
      currency: 'eur',
      data: { membership, paper_pubs: paper_pubs || undefined },
      person_id: id,
      person_name: name,
      type: 'upgrade'
    }))
    return newMemberItems.concat(upgradeItems)
  }

  getMembershipPurchaseData(db, {
    account,
    amount: reqAmount,
    email,
    new_members: reqNewMembers = [],
    source,
    upgrades: reqUpgrades = []
  }) {
    if (!email) throw new InputError('Required parameter: email')
    if (!reqAmount !== !source) {
      throw new InputError('If one is set, the other is required: amount, source')
    }
    if (reqNewMembers.length === 0 && reqUpgrades.length === 0) {
      throw new InputError('Non-empty new_members or upgrades is required')
    }
    const newMembers = reqNewMembers.map(src => new Person(src))
    return db.any(`
      SELECT key, amount
      FROM payment_types WHERE category IN ('new_member', 'paper_pubs')`
    )
      .then(rows => {
        const prices = rows.reduce((prices, { key, amount }) => {
          prices[key] = amount
          return prices
        }, {})
        return this.checkUpgrades(db, prices, reqUpgrades)
          .then(upgrades => ({ prices, upgrades }))
      })
      .then(({ prices, upgrades }) => {
        const items = this.getMembershipPaymentItems(prices, newMembers, upgrades)
        const amount = Number(reqAmount)
        const calcAmount = items.reduce((sum, item) => sum + item.amount, 0)
        if (amount !== calcAmount) {
          throw new InputError(`Amount mismatch: in request ${amount}, calculated ${calcAmount}`)
        }
        return { account, amount, email, items, newMembers, prices, source, upgrades }
      })
  }

  applyMembershipPurchase(req, db, paidItems, { charge_id, newMembers, upgrades }) {
    const applyUpgrade = (u) => upgradePerson(req, db, u)
      .then(({ member_number }) => {
        u.member_number = member_number
        return getKeyChecked(req, db, u.email)
      })
      .then(({ key }) => mailTask(
        ((!u.membership || u.membership === u.prev_membership) && u.paper_pubs)
          ? 'kansa-add-paper-pubs' : 'kansa-upgrade-person',
        Object.assign({ charge_id, key }, u)
      ))
    const applyNewMember = (m) => addPerson(req, db, m)
      .then(() => {
        const pi = paidItems.find(item => item.data === m.data)
        return pi && db.none(
          `UPDATE ${Payment.table} SET person_id=$1 WHERE id=$2`, [m.data.id, pi.id]
        );
      })
      .then(() => getKeyChecked(req, db, m.data.email))
      .then(({ key, set }) => {
        const data = Object.assign({ charge_id, key, name: m.preferredName }, m.data)
        return mailTask('kansa-new-member', data)
          .then(() => set ? data.email : null)
      })
    return Promise.all(
      upgrades.map(applyUpgrade).concat(newMembers.map(applyNewMember))
    )
  }

  makeMembershipPurchase(req, res, next) {
    let data
    return this.db.task(dbTask =>
      this.getMembershipPurchaseData(dbTask, req.body)
        .then(d => {
          data = d
          if (data.amount === 0) return []
          const { account, email, source, items } = data
          return new Payment(this.pgp, dbTask, account, email, source, items).process()
        })
        .then(paidItems => {
          if (paidItems[0]) data.charge_id = paidItems[0].stripe_charge_id
          return this.applyMembershipPurchase(req, dbTask, paidItems, data)
        })
        .then(newEmails => {
          if (!req.session.user) {
            const email = newEmails.find(e => e)
            if (email) req.session.user = { email, roles: {} };
          }
          res.json({ status: 'success', charge_id: data.charge_id });
        })
    ).catch(next);
  }

  makeDaypassPurchase(req, res, next) {
    const amount = Number(req.body.amount)
    const { email, passes, source } = req.body
    if (!amount || !email || !passes || passes.length === 0 || !source) return next(
      new InputError('Required parameters: amount, email, passes, source')
    )
    const passPeople = (req.body.passes || []).map(src => new Person(src))
    if (passPeople.some(p => p.passDays.length === 0)) return next(
      new InputError('All passes must include at least one day')
    )
    const newEmailAddresses = {}
    let charge_id
    this.calcDaypassAmounts(passPeople).then(calcSum => {
      if (amount !== calcSum) throw new InputError(`Amount mismatch: in request ${amount}, calculated ${calcSum}`)
      const items = passPeople.map(p => ({
        amount: p.passAmount,
        currency: 'eur',
        category: 'daypass',
        person_name: p.preferredName,
        type: `daypass-${p.data.membership}`,
        data: p.data
      }))
      return new Payment(this.pgp, this.db, 'default', email, source, items)
        .process()
    }).then(items => {
      charge_id = items[0].stripe_charge_id
      return Promise.all(
        passPeople.map(p => (
          addPerson(req, this.db, p)
            .then(() => {
              const pi = items.find(item => item.data === p.data)
              return pi && this.db.none(
                `UPDATE ${Payment.table} SET person_id=$1 WHERE id=$2`, [p.data.id, pi.id]
              )
            })
            .then(() => getKeyChecked(req, this.db, p.data.email))
            .then(({ key, set }) => {
              if (set) newEmailAddresses[p.data.email] = true
              return mailTask(
                'kansa-new-daypass',
                Object.assign({ charge_id, key, name: p.preferredName }, p.data)
              )
            })
        ))
      )
    }).then(() => {
      if (!req.session.user) {
        const nea = Object.keys(newEmailAddresses)
        if (nea.length >= 1) req.session.user = { email: nea[0], roles: {} }
      }
      res.json({ status: 'success', charge_id })
    }).catch(next)
  }

  makeOtherPurchase(req, res, next) {
    const { account, email, items, source } = req.body;
    new Payment(this.pgp, this.db, account, email, source, items)
      .process()
      .then(items => (
        Promise.all(items.map(item => this.db.one(`
            SELECT f.fields AS shape, t.types
              FROM payment_fields_by_category f
                    LEFT JOIN payment_types_by_category t USING (key)
              WHERE key = $1`, item.category
          )
            .then(({ shape, types }) => {
              const typeData = types.find(td => td.key === item.type);
              return mailTask('kansa-new-payment', Object.assign({
                email: item.person_email || item.payment_email,
                name: item.person_name || null,
                mandate_url: source.sepa_debit && source.sepa_debit.mandate_url || null,
                shape,
                typeLabel: typeData && typeData.label || item.type
              }, item));
            })
        ))
          .then(() => res.json({
            status: items[0].status,
            charge_id: items[0].stripe_receipt || items[0].stripe_charge_id
          }))
      ))
      .catch(next);
  }

  createInvoice(req, res, next) {
    if (!req.session.user || !req.session.user.member_admin) throw new AuthError()
    const { email, items } = req.body
    if (!email || !items || items.length === 0) throw new InputError('Required parameters: email, items')
    new Payment(this.pgp, this.db, 'default', email, null, items)
      .process()
      .then(items => {
        if (items.some(item => !item.id || item.status !== 'invoice')) {
          throw new Error('Bad item: ' + JSON.stringify(item))
        }
        return mailTask('kansa-new-invoice', { email, items })
      })
      .then(() => res.json({ status: 'success', email }))
      .catch(next)
  }
}

module.exports = Purchase;
