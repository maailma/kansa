const prices = require('../static/prices.json');
const purchaseData = require('../static/purchase-data.json');
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
    this.getPrices = this.getPrices.bind(this);
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

  getPrices(req, res, next) {
    if (!prices) next(new Error('Missing membership prices!?'));
    res.json(prices);
  }

  getPurchaseData(req, res, next) {
    if (!purchaseData) next(new Error('Missing purchase data!?'));
    res.json(purchaseData);
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
        .then(items => {
          res.status(200).end()
          items.forEach(item => {
            console.log('Updated payment', item.id, 'status to', status);
            const { shape, types } = purchaseData[item.category];
            const typeData = types.find(td => td.key === item.type);
            return mailTask('kansa-update-payment', Object.assign({
              email: item.person_email || item.payment_email,
              name: item.person_name || null,
              shape,
              typeLabel: typeData && typeData.label || item.type
            }, item));
          })
        })
        .catch(() => res.status(500).end())
    }
  }

  checkUpgrades(reqUpgrades) {
    if (reqUpgrades.length === 0) return Promise.resolve([]);
    return this.db.any(`
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
        } else {
          const ti0 = Person.membershipTypes.indexOf(prev.membership);
          const ti1 = Person.membershipTypes.indexOf(upgrade.membership);
          if (ti1 <= ti0) throw new InputError(
            `Can't "upgrade" from ${JSON.stringify(prev.membership)} to ${JSON.stringify(upgrade.membership)}`
          );
        }

        if (upgrade.paper_pubs) {
          if (prev.paper_pubs) throw new InputError(`${JSON.stringify(upgrade)} already has paper pubs!`);
        } else if (!upgrade.membership) {
          throw new InputError('Change in at least one of membership and/or paper_pubs is required for upgrade');
        }

        const prevPriceData = prices.memberships[prev.membership]
        const membershipAmount = upgrade.membership
          ? prices.memberships[upgrade.membership].amount - (prevPriceData && prevPriceData.amount || 0)
          : 0;
        const paperPubsAmount = upgrade.paper_pubs ? prices.PaperPubs.amount : 0;

        return Object.assign({}, upgrade, {
          amount: membershipAmount + paperPubsAmount,
          email: prev.email,
          name: prev.name,
          paper_pubs: Person.cleanPaperPubs(upgrade.paper_pubs),
          prev_membership: prev.membership
        });
      });
    });
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

  makeMembershipPurchase(req, res, next) {
    const amount = Number(req.body.amount);
    const { account, email, source } = req.body;
    if (!email) return next(new InputError('Required parameter: email'));
    if (!amount !== !source) return next(new InputError('If one is set, the other is required: amount, source'));
    const newMembers = (req.body.new_members || []).map(src => new Person(src));
    const reqUpgrades = req.body.upgrades || [];
    if (newMembers.length === 0 && reqUpgrades.length === 0) return next(
      new InputError('Non-empty new_members or upgrades is required')
    );
    const newEmailAddresses = {};
    let charge_id, paymentItems, upgrades;
    this.checkUpgrades(reqUpgrades).then(_upgrades => {
      upgrades = _upgrades;
      const newMemberPaymentItems = newMembers.map(p => ({
        amount: p.priceAsNewMember,
        currency: 'eur',
        category: 'new_member',
        person_name: p.preferredName,
        type: p.data.membership,
        data: p.data
      }));
      const upgradePaymentItems = upgrades.map(u => ({
        amount: u.amount,
        currency: 'eur',
        person_id: u.id,
        person_name: u.name,
        category: 'upgrade',
        type: 'upgrade',
        data: { membership: u.membership, paper_pubs: u.paper_pubs || undefined },
      }));
      const items = newMemberPaymentItems.concat(upgradePaymentItems);
      const calcAmount = items.reduce((sum, item) => sum + item.amount, 0);
      if (amount !== calcAmount) throw new InputError(`Amount mismatch: in request ${amount}, calculated ${calcAmount}`);
      return amount === 0 ? [] : new Payment(this.pgp, this.db, account, email, source, items)
        .process()
    }).then(_items => {
      paymentItems = _items;
      if (_items[0]) charge_id = _items[0].stripe_charge_id
      return Promise.all(upgrades.map(u => (
        upgradePerson(req, this.db, u)
          .then(({ member_number }) => {
            u.member_number = member_number;
            return getKeyChecked(req, this.db, u.email);
          })
          .then(({ key }) => mailTask(
            ((!u.membership || u.membership === u.prev_membership) && u.paper_pubs)
              ? 'kansa-add-paper-pubs' : 'kansa-upgrade-person',
            Object.assign({ charge_id, key }, u)
          ))
      )));
    }).then(() => Promise.all(
      newMembers.map(m => (
        addPerson(req, this.db, m)
          .then(() => {
            const pi = paymentItems.find(item => item.data === m.data);
            return pi && this.db.none(
              `UPDATE ${Payment.table} SET person_id=$1 WHERE id=$2`, [m.data.id, pi.id]
            );
          })
          .then(() => getKeyChecked(req, this.db, m.data.email))
          .then(({ key, set }) => {
            if (set) newEmailAddresses[m.data.email] = true;
            return mailTask(
              'kansa-new-member',
              Object.assign({ charge_id, key, name: m.preferredName }, m.data)
            );
          })
      ))
    )).then(() => {
      if (!req.session.user) {
        const nea = Object.keys(newEmailAddresses);
        if (nea.length >= 1) req.session.user = { email: nea[0], roles: {} };
      }
      res.status(200).json({ status: 'success', charge_id });
    }).catch(next);
  }

  makeOtherPurchase(req, res, next) {
    const { account, email, items, source } = req.body;
    new Payment(this.pgp, this.db, account, email, source, items)
      .process()
      .then(items => (
        Promise.all(items.map(item => {
          const { shape, types } = purchaseData[item.category];
          const typeData = types.find(td => td.key === item.type);
          return mailTask('kansa-new-payment', Object.assign({
            email: item.person_email || item.payment_email,
            name: item.person_name || null,
            mandate_url: source.sepa_debit && source.sepa_debit.mandate_url || null,
            shape,
            typeLabel: typeData && typeData.label || item.type
          }, item));
        }))
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
