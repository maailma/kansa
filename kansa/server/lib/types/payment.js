const InputError = require('./inputerror');
const purchaseData = require('../../static/purchase-data.json');

class Payment {
  static get fields() { return [
    'amount', 'category', 'currency', 'stripe_charge_id', 'email', 'name',
    'person', 'type', 'invoice', 'comments', 'data'
  ]}

  static get table() { return 'Payments'; }

  constructor(src) {
    if (src) {
      this.amount = Number(src.amount);
      this.category = src.category;
      this.comments = src.comments || null;
      this.currency = 'eur';
      this.data = src.data || null;
      this.email = src.email;
      this.invoice = src.invoice || null;
      this.name = src.name;
      this.person = Number(src.person) || null;
      this.token = src.token;
      this.type = src.type;
    }
    if (!this.amount || !this.category || !this.email || !this.name || !this.token) {
      throw new InputError('Required parameters: amount, category, email, name, token');
    }
    if (!purchaseData[this.category]) {
      throw new InputError('Supported categories: ' + Object.keys(purchaseData).join(', '));
    }
    const typeErrors = this.checkType();
    if (typeErrors) throw new InputError('Supported types: ' + JSON.stringify(typeErrors));
    const dataErrors = this.checkData();
    if (dataErrors) throw new InputError('Bad data: ' + JSON.stringify(dataErrors));
  }

  checkData() {
    const { required = [], shape = {} } = purchaseData[this.category];
    const missing = required.filter(key => !this.data[key] && this.data[key] !== false);
    const badType = Object.keys(shape || {}).filter(key => {
      if (missing.indexOf(key) !== -1) return false;
      const src = shape[key];
      const tgt = this.data[key];
      if (Array.isArray(src)) {
        return src.map(t => t.key).indexOf(tgt) === -1;
      } else {
        return typeof src !== typeof tgt;
      }
    });
    return missing.length || badType.length ? { missing, badType } : null;
  }

  checkType() {
    const types = purchaseData[this.category].types || [];
    return types.some(({ key }) => this.type === key) ? null : types;
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
