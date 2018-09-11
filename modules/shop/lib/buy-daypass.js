const { InputError } = require('@kansa/common/errors')
const { sendMail } = require('@kansa/common/mail')
const Payment = require('./payment')

function calcDaypassAmounts(db, passPeople) {
  return db.many(`SELECT * FROM daypass_amounts`).then(amounts => {
    const amount = (person, day) =>
      person.data[day]
        ? amounts.find(d => d.status === person.data.membership)[day]
        : 0
    const days = Object.keys(amounts[0]).filter(d => Number(amounts[0][d]) > 0)
    return passPeople.reduce((sum, person) => {
      person.passAmount = days.reduce(
        (sum, day) => sum + amount(person, day),
        0
      )
      return sum + person.passAmount
    }, 0)
  })
}

module.exports = function buyDaypass(db, ctx, req) {
  const amount = Number(req.body.amount)
  const { email, passes, source } = req.body
  if (!amount || !email || !passes || passes.length === 0 || !source)
    return Promise.reject(
      new InputError('Required parameters: amount, email, passes, source')
    )
  const passPeople = (req.body.passes || []).map(
    src => new ctx.people.Person(src)
  )
  if (passPeople.some(p => p.passDays.length === 0))
    return Promise.reject(
      new InputError('All passes must include at least one day')
    )
  const newEmailAddresses = {}
  let charge_id
  return calcDaypassAmounts(db, passPeople)
    .then(calcSum => {
      if (amount !== calcSum)
        throw new InputError(
          `Amount mismatch: in request ${amount}, calculated ${calcSum}`
        )
      const items = passPeople.map(p => ({
        amount: p.passAmount,
        currency: 'eur',
        category: 'daypass',
        person_name: p.preferredName,
        type: `daypass-${p.data.membership}`,
        data: p.data
      }))
      return new Payment(ctx, db, 'default', email, source, items).process()
    })
    .then(items => {
      charge_id = items[0].stripe_charge_id
      return Promise.all(
        passPeople.map(p =>
          ctx.people
            .addPerson(db, req, p)
            .then(() => {
              const pi = items.find(item => item.data === p.data)
              return (
                pi &&
                db.none(
                  `UPDATE ${Payment.table} SET person_id=$1 WHERE id=$2`,
                  [p.data.id, pi.id]
                )
              )
            })
            .then(() => ctx.user.refreshKey(db, ctx.config, req, p.data.email))
            .then(({ key, set }) => {
              if (set) newEmailAddresses[p.data.email] = true
              return sendMail(
                'kansa-new-daypass',
                Object.assign({ charge_id, key, name: p.preferredName }, p.data)
              )
            })
        )
      )
    })
    .then(() => {
      if (!req.session.user) {
        const nea = Object.keys(newEmailAddresses)
        if (nea.length >= 1) req.session.user = { email: nea[0], roles: {} }
      }
      return { status: 'success', charge_id }
    })
}
