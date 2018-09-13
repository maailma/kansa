const Stripe = require('stripe')
const config = require('@kansa/common/config')
const { InputError } = require('@kansa/common/errors')
const { generateToken } = require('./token')

function checkData(shape, data) {
  const missing = shape
    .filter(
      ({ key, required }) => required && !data[key] && data[key] !== false
    )
    .map(({ key }) => key)
  const badType = shape
    .filter(({ key, type, values }) => {
      if (missing.indexOf(key) !== -1) return false
      const tgt = data[key]
      if (!tgt) return false
      return (
        (type && typeof tgt !== type) ||
        (values && Object.keys(values).every(value => tgt !== value))
      )
    })
    .map(({ key }) => key)
  return missing.length || badType.length ? { missing, badType } : null
}

class Payment {
  static get fields() {
    return [
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
  }

  // https://stripe.com/docs/api/node#create_charge-statement_descriptor
  // max 22 chars
  static get statement_descriptor() {
    return `${config.name} membership`
  }

  static get table() {
    return 'payments'
  }

  constructor(pgHelpers, db, account, email, source, items) {
    this.pgHelpers = pgHelpers
    this.db = db
    this.account = account || 'default'
    this.email = email
    this.purchaseData = {}
    this.source = source
    this.items = items.map(item => ({
      id: item.id || null,
      updated: null,
      payment_email: email,
      status: source ? 'chargeable' : 'invoice',
      stripe_charge_id: null,
      stripe_receipt: null,
      stripe_token: (source && source.id) || null,
      amount: Number(item.amount),
      currency: item.currency || 'eur',
      person_email: null,
      person_id: Number(item.person_id) || null,
      person_name: item.person_name || null,
      category: item.category,
      type: item.type,
      data: item.data || null,
      invoice: item.invoice || null,
      comments: item.comments || null
    }))
  }

  get stripe() {
    let keyvar = 'STRIPE_SECRET_APIKEY'
    if (this.account !== 'default') keyvar += '_' + this.account
    const key = process.env[keyvar]
    return new Stripe(key)
  }

  validate() {
    return new Promise((resolve, reject) => {
      if (!this.email) {
        reject(new InputError('A valid email is required'))
      } else if (this.source && !this.source.id) {
        reject(new InputError('A valid source is required'))
      } else if (!this.items || this.items.length === 0) {
        reject(new InputError('At least one item is required'))
      } else {
        const currency = this.items[0].currency
        for (let i = 0; i < this.items.length; ++i) {
          const item = this.items[i]
          if (item.id) continue
          if (!item.amount || !item.currency || !item.category || !item.type) {
            return reject(
              new InputError(
                'Required parameters: amount, currency, category, type'
              )
            )
          }
          if (item.currency !== currency) {
            return reject(new InputError('Currencies of all items must match!'))
          }
          if (!item.person_id && !item.payment_email) {
            return reject(
              new InputError('Either person_id or email is required')
            )
          }
          if (
            item.status === 'invoice' &&
            (item.stripe_charge_id || item.stripe_receipt || item.stripe_token)
          ) {
            return reject(
              new InputError(
                'Invoice items cannot have associated payment data'
              )
            )
          }
        }
        resolve()
      }
    })
      .then(() => {
        const categories = this.items.map(it => it.category).filter(c => c)
        return categories.length === 0
          ? []
          : this.db.manyOrNone(
              `
          SELECT key, c.allow_create_account, c.custom_email,
                 f.fields AS shape, t.types
            FROM payment_categories c
                 LEFT JOIN payment_fields_by_category f USING (key)
                 LEFT JOIN payment_types_by_category t USING (key)
           WHERE key IN ($1:csv)`,
              [categories]
            )
      })
      .then(rows => {
        this.purchaseData = rows.reduce((data, row) => {
          data[row.key] = row
          return data
        }, {})
        this.items.filter(it => !it.id).forEach(item => {
          const data = this.purchaseData[item.category]
          if (!data) {
            throw new InputError(
              'Unknown payment category: ' + JSON.stringify(item.category)
            )
          }
          if (data.types && data.types.every(({ key }) => item.type !== key)) {
            throw new InputError(
              `Unknown type ${JSON.stringify(item.type)} for payment category ${
                item.category
              }`
            )
          }
          switch (item.type) {
            case 'ss-token':
              item.data = { token: generateToken() }
              break
          }
          const dataErrors = checkData(data.shape || [], item.data)
          if (dataErrors)
            throw new InputError('Bad data: ' + JSON.stringify(dataErrors))
        })
      })
      .then(() => {
        const itemIds = this.items.map(it => it.id).filter(id => id)
        return itemIds.length === 0
          ? null
          : this.db
              .many(
                `
          SELECT a.id, a.status, a.amount, a.currency, a.person_id,
                 a.category, a.type, a.data, a.invoice,
                 p.email AS person_email, preferred_name(p) AS person_name,
                 c.allow_create_account, c.custom_email, t.label AS type_label
            FROM Payments a
                 LEFT JOIN People p ON (a.person_id = p.id)
                 LEFT JOIN payment_categories c ON (a.category = c.key)
                 LEFT JOIN payment_types t ON (a.type = t.key)
           WHERE a.id in ($1:csv)`,
                [itemIds]
              )
              .then(dbItems => {
                dbItems.forEach(dbItem => {
                  const item = this.items.find(item => item.id === dbItem.id)
                  Object.assign(item, dbItem)
                })
                const notFound = this.items.find(item => !item.type)
                if (notFound)
                  throw new Error(
                    'Payment not found: ' + JSON.stringify(notFound)
                  )
              })
      })
      .then(() => {
        const personIds = Object.keys(
          this.items.reduce((set, item) => {
            const id = Number(item.person_id)
            if (id > 0 && !item.person_email) {
              const pd = this.purchaseData[item.category]
              if (!(pd || item).custom_email) set[id] = true
            }
            return set
          }, {})
        )
        return personIds.length === 0
          ? null
          : this.db
              .many(
                `
              SELECT id, email, preferred_name(p) as name
                FROM People p
               WHERE id in ($1:csv)`,
                [personIds]
              )
              .then(data =>
                this.items.forEach(item => {
                  const id = item.person_id
                  const pd = id && data.find(d => d.id === id)
                  if (pd) {
                    item.person_email = pd.email
                    if (!item.person_name) item.person_name = pd.name
                  }
                })
              )
      })
      .then(
        () =>
          this.items.every(item => {
            const pd = this.purchaseData[item.category]
            return (pd || item).allow_create_account
          })
            ? Promise.resolve()
            : this.db
                .many(`SELECT id FROM People WHERE email=$1`, this.email)
                .catch(error =>
                  Promise.reject(
                    error.message === 'No data returned from the query.'
                      ? new InputError(
                          'Not a known email address: ' +
                            JSON.stringify(this.email)
                        )
                      : error
                  )
                )
      )
  }

  record() {
    const charges = this.items.map(item => item.stripe_charge_id).filter(c => c)
    if (charges.length)
      throw new Error('Payment already made? charge ids:' + charges)
    const newItems = this.items.filter(item => !item.id)
    if (newItems.length === 0) return null
    const sqlInsert = this.pgHelpers.insert(
      newItems,
      Payment.fields,
      Payment.table
    )
    return this.db
      .many(`${sqlInsert} RETURNING id`)
      .catch(error =>
        Promise.reject(
          error.message &&
          error.message.indexOf('payments_person_id_fkey') !== -1
            ? new InputError('Not a valid person id: ' + error.detail)
            : error
        )
      )
      .then(ids => ids.forEach(({ id }, i) => (newItems[i].id = id)))
  }

  charge() {
    const amount = this.items.reduce((sum, item) => sum + item.amount, 0)
    const currency = this.items[0].currency
    const labels = this.items.reduce((set, item) => {
      const pd = this.purchaseData[item.category]
      const typeData = pd && pd.types.find(type => type.key === item.type)
      const label = (typeData && typeData.label) || item.type_label || item.type
      set[label] = (set[label] || 0) + 1
      return set
    }, {})
    const itemsDesc = Object.keys(labels)
      .map(label => (labels[label] > 1 ? `${labels[label]}*${label}` : label))
      .join(', ')
    return this.stripe.charges
      .create({
        amount,
        currency,
        description: `Charge of €${amount / 100} by ${
          this.email
        } for ${itemsDesc}`,
        metadata: { items: this.items.map(item => item.id).join(',') },
        receipt_email: this.email,
        source: this.source.id,
        statement_descriptor: Payment.statement_descriptor
      })
      .then(charge => {
        const _charge = {
          updated: new Date(charge.created * 1000),
          status: charge.status,
          stripe_receipt: charge.receipt_number,
          stripe_charge_id: charge.id
        }
        _charge.items = this.items.map(item => {
          Object.assign(item, _charge)
          return item.id
        })
        return this.db.none(
          `
        UPDATE ${Payment.table}
           SET updated=$(updated), status=$(status),
               stripe_charge_id=$(stripe_charge_id),
               stripe_receipt=$(stripe_receipt)
         WHERE id IN ($(items:csv))`,
          _charge
        )
      })
  }

  process() {
    return this.validate()
      .then(() => this.record())
      .then(() => this.source && this.charge())
      .then(() => this.items)
      .catch(error => {
        const ids = this.items.map(item => item.id).filter(id => id)
        if (ids.length) {
          return this.db
            .none(
              `
            UPDATE ${Payment.table}
               SET error=$(msg)
             WHERE id IN ($(ids:csv))`,
              { ids, msg: error.message || error }
            )
            .then(() => {
              throw error
            })
        } else {
          throw error
        }
      })
  }
}

module.exports = Payment
