const Stripe = require('stripe');

class Payment {
  constructor({ amount, description, email, stripe_src_id }, metadata = {}) {
    if (!Number.isInteger(amount) || amount <= 0) throw new TypeError('Amount needs to be a positive integer');
    if (!description) throw new TypeError('A description is required.');
    if (!email) throw new TypeError('An email address is required.');
    if (!stripe_src_id) throw new TypeError('A Stripe source id is required.');
    this._charge = {
      amount,
      currency: 'eur',
      description,
      metadata,
      receipt_email: email,
      source: stripe_src_id
    };
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  charge() {
    return this.stripe.charges.create(this._charge);
  }
}

module.exports = Payment;