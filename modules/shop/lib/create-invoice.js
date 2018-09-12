const { InputError } = require('@kansa/common/errors')
const { sendMail } = require('@kansa/common/mail')
const Payment = require('./payment')

module.exports = function createInvoice(db, ctx, { email, items }) {
  if (!email || !items || items.length === 0)
    return Promise.reject(new InputError('Required parameters: email, items'))
  return new Payment('default', email, null, items)
    .process(ctx, db, {})
    .then(async items => {
      if (items.some(item => !item.id || item.status !== 'invoice')) {
        throw new Error('Bad item: ' + JSON.stringify(item))
      }
      await sendMail('kansa-new-invoice', { email, items })
      return email
    })
}
