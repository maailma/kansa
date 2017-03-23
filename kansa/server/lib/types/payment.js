const Promise = require('bluebird');
const InputError = require('./inputerror');
const purchaseData = require('../../static/purchase-data.json');

class Payment {
  static get fields() { return [
    'amount', 'category', 'currency', 'stripe_charge_id', 'email', 'name',
    'person_id', 'type', 'invoice', 'comments', 'data'
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
      this.person_id = Number(src.person_id) || null;
      this.token = src.token;
      this.type = src.type;
    }
  }

  validate(db) {
    const rejectInput = (reason) => Promise.reject(new InputError(reason));
    if (!this.amount || !this.category || !this.token || !this.type) {
      return rejectInput('Required parameters: amount, category, token, type');
    }
    if (!this.person_id && !(this.email && this.name)) {
      return rejectInput('Either person_id or email & name are required');
    }
    if (!purchaseData[this.category]) {
      return rejectInput('Supported categories: ' + Object.keys(purchaseData).join(', '));
    }
    const typeErrors = this.checkType();
    if (typeErrors) return rejectInput('Supported types: ' + JSON.stringify(typeErrors));
    const dataErrors = this.checkData();
    if (dataErrors) return rejectInput('Bad data: ' + JSON.stringify(dataErrors));
    return (
      this.person_id
        ? db.one(`SELECT email, legal_name FROM People WHERE id=$1`, this.person_id)
            .catch((error) => (
              error.message === 'No data returned from the query.'
                ? rejectInput('Not a valid person id: ' + this.person_id)
                : Promise.reject(error)
            ))
        : Promise.resolve({})
    ).then(({ email, legal_name }) => {
      if (legal_name && !this.name) this.name = legal_name;
      if (email && !this.email) {
        this.email = email;
      } else if (email !== this.email) {
        return db.many(`SELECT id FROM People WHERE email=$1`, this.email)
          .catch((error) => (
            error.message === 'No data returned from the query.'
              ? rejectInput('Not a known email address: ' + JSON.stringify(this.email))
              : Promise.reject(error)
          ));
      }
      return null;
    });
  }

  checkData() {
    const { shape = {} } = purchaseData[this.category];
    const missing = Object.keys(shape).filter(key => (
      shape[key].required && !this.data[key] && this.data[key] !== false
    ));
    const badType = Object.keys(shape || {}).filter(key => {
      if (missing.indexOf(key) !== -1) return false;
      const src = shape[key];
      const tgt = this.data[key];
      if (src.type && (typeof tgt) !== src.type) return true;
      if (src.values && (
        Object.keys(src.values).every(key => tgt !== key)
      )) return true;
      return false;
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
        RETURNING email, stripe_charge_id`, this);
  }
}

module.exports = Payment;
