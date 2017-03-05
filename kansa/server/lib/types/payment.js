const InputError = require('./inputerror');
const purchaseData = require('../../static/purchase-data.json');

class Payment {
  static get fields() { return [
    'amount', 'currency', 'stripe_charge_id', 'email', 'name', 'person',
    'type', 'invoice', 'comments', 'data'
  ]}

  static get table() { return 'Payments'; }

  static get types() { return [
    'Membership', 'HotelRoom', 'ArtShowReg', 'TableReg', 'Sponsorship'
  ]}

  constructor(src) {
    if (src) {
      this.amount = Number(src.amount);
      this.currency = 'eur';
      this.email = src.email;
      this.name = src.name;
      this.token = src.token;
      this.type = src.type;
    }
    if (!this.amount || !this.email || !this.name || !this.token || !this.type) {
      throw new InputError('Required parameters: amount, email, name, token, type');
    }
    if (Payment.types.indexOf(this.type) === -1) {
      throw new InputError('Supported types: ' + Payment.types.join(', '));
    }
    this.comments = src.comments || null;
    this.data = src.data || null;
    this.invoice = src.invoice || null;
    this.person = Number(src.person) || null;
    const dataErrors = this.checkData();
    if (dataErrors) throw new InputError('Bad data: ' + JSON.stringify(dataErrors));
  }

  checkData() {
    const pd = purchaseData[this.type];
    const rd = pd && pd.required || [];
    const missing = rd.filter(key => !this.data[key] && this.data[key] !== false);
    const badType = Object.keys(pd.shape || {}).filter(key => {
      const src = pd.shape[key];
      const tgt = this.data[key];
      if (Array.isArray(src)) {
        return src.map(t => t.key).indexOf(tgt) === -1;
      } else {
        return typeof src === typeof tgt;
      }
    });
    return missing.length || badType.length ? { missing, badType } : null;
  }

  insert(db, stripe_charge_id) {
    if (this.stripe_charge_id) throw new Error('Payment already inserted? ' + stripe_charge_id);
    this.stripe_charge_id = stripe_charge_id;
    const fields = Payment.fields.filter(fn => this.hasOwnProperty(fn) && this[fn]);
    const values = fields.map(fn => `$(${fn})`).join(', ');
    return db.one(`
      INSERT INTO ${Payment.table} (${fields.join(', ')})
           VALUES (${values})
        RETURNING stripe_charge_id`, this);
  }
}

module.exports = Payment;
