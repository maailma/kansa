const { InputError } = require('@kansa/common/errors')
const { getCategoryData, getItemData, getEmailData } = require('./get-data')
const { validateParameters, validateItem } = require('./validate')
const { generateToken } = require('../token')

const paymentFields = [
  'updated',
  'payment_email',
  'status',
  'amount',
  'currency',
  'stripe_charge_id',
  'stripe_receipt',
  'stripe_token',
  'person_id',
  'person_name',
  'category',
  'type',
  'data',
  'invoice',
  'comments'
]

function validateAndComplete(db, { email, source, items }) {
  return new Promise((resolve, reject) => {
    const errMsg = validateParameters(email, source, items)
    if (errMsg) reject(new InputError(errMsg))
    else resolve()
  }).then(async () => {
    const categories = await getCategoryData(db, items)

    items.filter(it => !it.id).forEach(item => {
      if (item.type === 'ss-token') {
        item.data = { token: generateToken() }
      }
      const errMsg = validateItem(item, categories)
      if (errMsg) throw new InputError(errMsg)
    })

    const dbItems = await getItemData(db, items)
    dbItems.forEach(di => {
      const item = items.find(item => item.id === di.id)
      Object.assign(item, di)
    })
    const notFound = items.find(item => !item.type)
    if (notFound)
      throw new Error('Payment not found: ' + JSON.stringify(notFound))

    const emails = await getEmailData(db, items, categories)
    items.forEach(it => {
      const id = it.person_id
      const ed = id && emails.find(d => d.id === id)
      if (ed) {
        it.person_email = ed.email
        if (!it.person_name) it.person_name = ed.name
      }
    })

    const allowCreate = items.every(it => {
      const pd = categories[it.category]
      return (pd || it).allow_create_account
    })
    if (!allowCreate) {
      const known = await db.oneOrNone(
        `SELECT 1 FROM People WHERE email=$1 LIMIT 1`,
        email
      )
      if (!known) {
        throw new InputError(
          'Not a known email address: ' + JSON.stringify(email)
        )
      }
    }

    return categories
  })
}

function record(pgp, db, { items }) {
  const charges = items.map(item => item.stripe_charge_id).filter(c => c)
  if (charges.length)
    throw new Error('Payment already made? charge ids:' + charges)
  const newItems = items.filter(item => !item.id)
  if (newItems.length === 0) return null
  const sqlInsert = pgp.helpers.insert(newItems, paymentFields, 'payments')
  return db
    .many(`${sqlInsert} RETURNING id`)
    .catch(error =>
      Promise.reject(
        error.message && error.message.indexOf('payments_person_id_fkey') !== -1
          ? new InputError('Not a valid person id: ' + error.detail)
          : error
      )
    )
    .then(ids => ids.forEach(({ id }, i) => (newItems[i].id = id)))
}

function getChargeDescription(categories, items) {
  const labels = items.reduce((set, item) => {
    const cd = categories[item.category]
    const typeData = cd && cd.types.find(type => type.key === item.type)
    const label = (typeData && typeData.label) || item.type_label || item.type
    set[label] = (set[label] || 0) + 1
    return set
  }, {})
  return Object.keys(labels)
    .map(label => (labels[label] > 1 ? `${labels[label]}*${label}` : label))
    .join(', ')
}

function charge(db, config, categories, { email, items, source, stripe }) {
  const amount = items.reduce((sum, item) => sum + item.amount, 0)
  const currency = items[0].currency
  const description = getChargeDescription(categories, items)
  return stripe.charges
    .create({
      amount,
      currency,
      description,
      metadata: { items: items.map(item => item.id).join(',') },
      receipt_email: email,
      source: source.id,
      // https://stripe.com/docs/api/node#create_charge-statement_descriptor
      statement_descriptor: config.name.substr(0, 22)
    })
    .then(charge => {
      const _charge = {
        updated: new Date(charge.created * 1000),
        status: charge.status,
        stripe_receipt: charge.receipt_number,
        stripe_charge_id: charge.id
      }
      _charge.items = items.map(item => {
        Object.assign(item, _charge)
        return item.id
      })
      return db.none(
        `
        UPDATE payments
           SET updated=$(updated), status=$(status),
               stripe_charge_id=$(stripe_charge_id),
               stripe_receipt=$(stripe_receipt)
         WHERE id IN ($(items:csv))`,
        _charge
      )
    })
}

module.exports = function processPayment({ config, pgp }, db, payment) {
  return db
    .task(async ts => {
      const categories = await validateAndComplete(ts, payment)
      await record(pgp, ts, payment)
      return categories
    })
    .then(categories => {
      if (payment.source) return charge(db, config, categories, payment)
    })
    .catch(async error => {
      const ids = payment.items.map(it => it.id).filter(id => id)
      if (ids.length > 0) {
        const update = `UPDATE payments SET error=$(msg) WHERE id IN ($(ids:csv))`
        await db.none(update, { ids, msg: error.message || error })
      }
      throw error
    })
}
