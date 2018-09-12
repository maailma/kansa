const { InputError } = require('@kansa/common/errors')
const { sendMail } = require('@kansa/common/mail')
const Payment = require('./payment')

class Purchase {
  constructor(db, ctx) {
    this.db = db
    this.ctx = ctx
    this.createInvoice = this.createInvoice.bind(this)
    this.getDaypassPrices = this.getDaypassPrices.bind(this)
    this.getPurchaseData = this.getPurchaseData.bind(this)
    this.getPurchases = this.getPurchases.bind(this)
    this.getStripeKeys = this.getStripeKeys.bind(this)
  }

  getDaypassPrices(req, res, next) {
    this.db.many(`SELECT * FROM daypass_amounts`).then(amounts =>
      res.json(
        amounts.reduce((map, row) => {
          map[row.status] = Object.assign(row, { status: undefined })
          return map
        }, {})
      )
    )
  }

  getPurchaseData(req, res, next) {
    this.db
      .many(
        `
      SELECT c.key, c.label, c.account, c.allow_create_account,
             c.listed, c.description, f.fields AS shape, t.types
        FROM payment_categories c
             LEFT JOIN payment_fields_by_category f USING (key)
             LEFT JOIN payment_types_by_category t USING (key)
    `
      )
      .then(rows =>
        res.json(
          rows.reduce((data, row) => {
            data[row.key] = row
            delete row.key
            Object.keys(row)
              .filter(key => row[key] == null)
              .forEach(key => {
                delete row[key]
              })
            return data
          }, {})
        )
      )
  }

  getStripeKeys(req, res, next) {
    const type = 'pk_' + process.env.STRIPE_SECRET_APIKEY.slice(3, 7)
    this.db
      .any(`SELECT name, key FROM stripe_keys WHERE type = $1`, type)
      .then(data =>
        res.json(
          data.reduce((keys, { name, key }) => {
            keys[name] = key
            return keys
          }, {})
        )
      )
  }

  getPurchases(req, res, next) {
    let { email } = req.session.user
    if (req.session.user.member_admin) {
      if (req.query.email) {
        email = req.query.email
      } else if (req.query.all) {
        return this.db
          .any(`SELECT * FROM Payments`)
          .then(data => res.json(data))
          .catch(next)
      }
    }
    this.db
      .any(
        `SELECT * FROM Payments
        WHERE payment_email=$1 OR person_id IN (
          SELECT id FROM People WHERE email=$1
        )`,
        email
      )
      .then(data => res.json(data))
      .catch(next)
  }

  createInvoice(req, res, next) {
    const { email, items } = req.body
    if (!email || !items || items.length === 0)
      throw new InputError('Required parameters: email, items')
    new Payment(this.ctx, this.db, 'default', email, null, items)
      .process()
      .then(items => {
        if (items.some(item => !item.id || item.status !== 'invoice')) {
          throw new Error('Bad item: ' + JSON.stringify(item))
        }
        return sendMail('kansa-new-invoice', { email, items })
      })
      .then(() => res.json({ status: 'success', email }))
      .catch(next)
  }
}

module.exports = Purchase
