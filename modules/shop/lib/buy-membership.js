const { InputError } = require('@kansa/common/errors')
const { sendMail } = require('@kansa/common/mail')
const Payment = require('./payment')

function getMembershipPurchaseData(
  db,
  ctx,
  {
    account,
    amount: reqAmount,
    email,
    new_members: reqNewMembers = [],
    source,
    upgrades: reqUpgrades = []
  }
) {
  if (!email) throw new InputError('Required parameter: email')
  if (!reqAmount !== !source) {
    throw new InputError('If one is set, the other is required: amount, source')
  }
  if (reqNewMembers.length === 0 && reqUpgrades.length === 0) {
    throw new InputError('Non-empty new_members or upgrades is required')
  }
  const newMembers = reqNewMembers.map(src => new ctx.people.Person(src))
  return db
    .any(
      `
      SELECT key, amount
      FROM payment_types WHERE category IN ('new_member', 'paper_pubs')`
    )
    .then(rows => {
      const prices = rows.reduce((prices, { key, amount }) => {
        prices[key] = amount
        return prices
      }, {})
      return checkUpgrades(db, ctx, prices, reqUpgrades).then(upgrades => ({
        prices,
        upgrades
      }))
    })
    .then(({ prices, upgrades }) => {
      const items = getMembershipPaymentItems(
        ctx.config,
        prices,
        newMembers,
        upgrades
      )
      const amount = Number(reqAmount)
      const calcAmount = items.reduce((sum, item) => sum + item.amount, 0)
      if (amount !== calcAmount) {
        throw new InputError(
          `Amount mismatch: in request ${amount}, calculated ${calcAmount}`
        )
      }
      return {
        account,
        amount,
        email,
        items,
        newMembers,
        prices,
        source,
        upgrades
      }
    })
}

function checkUpgrades(db, ctx, prices, reqUpgrades) {
  if (reqUpgrades.length === 0) return Promise.resolve([])
  return db
    .any(
      `
      SELECT id, email, membership, preferred_name(p) as name, paper_pubs
        FROM People p
       WHERE id IN ($1:csv)`,
      [reqUpgrades.map(u => u.id)]
    )
    .then(prevData => {
      if (prevData.length !== reqUpgrades.length)
        throw new InputError(
          `Error in upgrades: found ${prevData.length} of ${
            reqUpgrades.length
          } memberships`
        )
      return reqUpgrades.map(upgrade => {
        const prev = prevData.find(m => m.id === upgrade.id)
        if (!prev || !prev.membership)
          throw new InputError(
            `Previous membership not found for ${JSON.stringify(upgrade)}`
          )
        if (!upgrade.membership || upgrade.membership === prev.membership) {
          delete upgrade.membership
        } else if (prices[upgrade.membership] < prices[prev.membership]) {
          throw new InputError(
            `Can't upgrade from ${JSON.stringify(
              prev.membership
            )} to ${JSON.stringify(upgrade.membership)}`
          )
        }

        if (upgrade.paper_pubs) {
          if (!ctx.config.paid_paper_pubs)
            throw new InputError(
              'Paper pubs are not a paid option, so cannot be a part of an upgrade'
            )
          if (prev.paper_pubs)
            throw new InputError(
              `${JSON.stringify(upgrade)} already has paper pubs!`
            )
        } else if (!upgrade.membership) {
          throw new InputError(
            `Change in ${
              ctx.config.paid_paper_pubs
                ? 'at least one of membership and/or paper_pubs'
                : 'membership'
            } is required for upgrade`
          )
        }

        let amount = 0
        if (upgrade.membership)
          amount +=
            (prices[upgrade.membership] || 0) - (prices[prev.membership] || 0)
        if (upgrade.paper_pubs) amount += prices.paper_pubs
        return Object.assign({}, upgrade, {
          amount,
          email: prev.email,
          name: prev.name,
          paper_pubs: ctx.people.Person.cleanPaperPubs(upgrade.paper_pubs),
          prev_membership: prev.membership
        })
      })
    })
}

function getMembershipPaymentItems(config, prices, newMembers, upgrades) {
  const newMemberItems = newMembers.map(({ data }) => {
    const mp = prices[data.membership]
    if (typeof mp !== 'number' || mp < 0) {
      throw new InputError(
        `Membership type not available for purchase: ${JSON.stringify(
          data.membership
        )}`
      )
    }
    const pp =
      (config.paid_paper_pubs && data.paper_pubs && prices.paper_pubs) || 0
    return {
      amount: mp + pp,
      category: 'new_member',
      currency: 'eur',
      data,
      person_name: data.preferredName,
      type: data.membership
    }
  })
  const upgradeItems = upgrades.map(
    ({ amount, id, membership, name, paper_pubs }) => ({
      amount,
      category: 'upgrade',
      currency: 'eur',
      data: { membership, paper_pubs: paper_pubs || undefined },
      person_id: id,
      person_name: name,
      type: 'upgrade'
    })
  )
  return newMemberItems.concat(upgradeItems)
}

function applyMembershipPurchase(
  db,
  ctx,
  req,
  paidItems,
  { charge_id, newMembers, upgrades }
) {
  const applyUpgrade = u =>
    ctx.people
      .upgradePerson(req, db, u)
      .then(({ member_number }) => {
        u.member_number = member_number
        return ctx.user.refreshKey(db, ctx.config, req, u.email)
      })
      .then(({ key }) =>
        sendMail(
          (!u.membership || u.membership === u.prev_membership) && u.paper_pubs
            ? 'kansa-add-paper-pubs'
            : 'kansa-upgrade-person',
          Object.assign({ charge_id, key }, u)
        )
      )
  const applyNewMember = m =>
    ctx.people
      .addPerson(db, req, m)
      .then(() => {
        const pi = paidItems.find(item => item.data === m.data)
        return (
          pi &&
          db.none(`UPDATE payments SET person_id=$1 WHERE id=$2`, [
            m.data.id,
            pi.id
          ])
        )
      })
      .then(() => ctx.user.refreshKey(db, ctx.config, req, m.data.email))
      .then(({ key, set }) => {
        const data = Object.assign(
          { charge_id, key, name: m.preferredName },
          m.data
        )
        return sendMail('kansa-new-member', data).then(
          () => (set ? data.email : null)
        )
      })
  return Promise.all(
    upgrades.map(applyUpgrade).concat(newMembers.map(applyNewMember))
  )
}

module.exports = function buyMembership(db, ctx, req) {
  let data
  return db.task(dbTask =>
    getMembershipPurchaseData(dbTask, ctx, req.body)
      .then(d => {
        data = d
        if (data.amount === 0) return []
        const { account, email, source, items } = data
        return new Payment(account, email, source, items).process(ctx, dbTask)
      })
      .then(paidItems => {
        if (paidItems[0]) data.charge_id = paidItems[0].stripe_charge_id
        return applyMembershipPurchase(dbTask, ctx, req, paidItems, data)
      })
      .then(newEmails => {
        if (!req.session.user) {
          const email = newEmails.find(e => e)
          if (email) req.session.user = { email, roles: {} }
        }
        return { status: 'success', charge_id: data.charge_id }
      })
  )
}
