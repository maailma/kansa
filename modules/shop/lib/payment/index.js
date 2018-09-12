const processPayment = require('./process')

class Payment {
  constructor(account, email, source, items) {
    this.account = account || 'default'
    this.email = email
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

  async process(ctx, db, cfg) {
    await processPayment(ctx, db, cfg.apikey_vars, this)
    return this.items
  }
}

module.exports = Payment
