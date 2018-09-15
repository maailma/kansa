const debug = require('debug')('kansa:stripe')
const { InputError } = require('@kansa/common/errors')
const { sendMail } = require('@kansa/common/mail')

const updatePaymentStatus = (db, id, status, created) =>
  db.any(
    `UPDATE payments
    SET updated=$(updated), status=$(status)
    WHERE stripe_charge_id=$(id) and status!=$(status)
    RETURNING *`,
    { id, status, updated: new Date(created * 1000) }
  )

const getPaymentCategory = (db, category) =>
  db.one(
    `SELECT f.fields AS shape, t.types
    FROM payment_fields_by_category f
      LEFT JOIN payment_types_by_category t USING (key)
    WHERE key = $1`,
    category
  )

module.exports = function handleStripeWebhook(db, { created, data }) {
  const { id, object, status } = data.object
  if (typeof created !== 'number' || !id || !status || object !== 'charge') {
    const errMsg = 'Error: Unexpected Stripe webhook data'
    return Promise.reject(new InputError(errMsg))
  }
  return db
    .task(ts =>
      updatePaymentStatus(ts, id, status, created).then(async items => {
        const categories = items.reduce((cc, { category }) => {
          if (!cc.includes(category)) cc.push(category)
          return cc
        }, [])
        const ccData = await Promise.all(
          categories.map(c => getPaymentCategory(ts, c))
        )
        return { ccData, items }
      })
    )
    .then(({ ccData, items }) =>
      items.map(async item => {
        debug(`Updated payment ${item.id} status to ${status}`)
        const { shape, types } = ccData[item.category]
        const typeData = types.find(td => td.key === item.type)
        await sendMail(
          'kansa-update-payment',
          Object.assign(
            {
              email: item.person_email || item.payment_email,
              name: item.person_name || null,
              shape,
              typeLabel: (typeData && typeData.label) || item.type
            },
            item
          )
        )
      })
    )
}
