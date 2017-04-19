const Promise = require('bluebird');
const randomstring = require('randomstring');
const stripe = require('stripe')(process.env.STRIPE_SECRET_APIKEY);

const InputError = require('./inputerror');
const purchaseData = require('../../static/purchase-data.json');

const CUSTOM_EMAIL_CATEGORIES = ['New membership', 'Paper publications', 'Upgrade membership'];

const generateToken = () => randomstring.generate({
  length: 6,
  charset: 'ABCDEFHJKLMNPQRTUVWXY0123456789'
});

function checkData(category, data) {
  const { shape = {} } = purchaseData[category];
  const missing = Object.keys(shape).filter(key => (
    shape[key].required && !data[key] && data[key] !== false
  ));
  const badType = Object.keys(shape || {}).filter(key => {
    if (missing.indexOf(key) !== -1) return false;
    const src = shape[key];
    const tgt = data[key];
    if (!tgt) return false;
    if (src.type && (typeof tgt) !== src.type) return true;
    if (src.values && (
      Object.keys(src.values).every(key => tgt !== key)
    )) return true;
    return false;
  });
  return missing.length || badType.length ? { missing, badType } : null;
}

function checkType(category, type) {
  const types = purchaseData[category].types || [];
  return types.some(({ key }) => type === key) ? null : types;
}

function validateItem(item, currency) {
  if (!item.amount || !item.currency || !item.category || !item.type) {
    throw new InputError('Required parameters: amount, currency, category, type');
  }
  if (item.currency !== currency) {
    throw new InputError('Currencies of all items must match!');
  }
  if (!item.person_id && !item.payment_email) {
    throw new InputError('Either person_id or email is required');
  }
  if (!purchaseData[item.category]) {
    throw new InputError('Supported categories: ' + Object.keys(purchaseData).join(', '));
  }
  const typeErrors = checkType(item.category, item.type);
  if (typeErrors) throw new InputError('Supported types: ' + JSON.stringify(typeErrors));
  switch (item.type) {
    case 'ss-token':
      item.data = { token: generateToken() }
      break;
  }
  const dataErrors = checkData(item.category, item.data);
  if (dataErrors) throw new InputError('Bad data: ' + JSON.stringify(dataErrors));
}


class Payment {
  static get fields() { return [
    'payment_email', 'stripe_charge_id', 'stripe_token', 'amount', 'currency',
    'paid', 'person_id', 'person_name', 'category', 'type', 'data',
    'invoice', 'comments'
  ]}

  // https://stripe.com/docs/api/node#create_charge-statement_descriptor
  // max 22 chars
  static get statement_descriptor() { return 'Worldcon 75 membership'; }

  static get table() { return 'payments'; }

  constructor(pgp, db, token, items) {
    this.pgp = pgp;
    this.db = db;
    this.token = token;
    this.items = items.map(item => ({
      id: null,
      payment_email: token.email,
      stripe_charge_id: null,
      stripe_token: token.id,
      amount: Number(item.amount),
      currency: item.currency || 'eur',
      paid: null,
      person_email: null,
      person_id: Number(item.person_id) || null,
      person_name: item.person_name || null,
      category: item.category,
      type: item.type,
      data: item.data || null,
      invoice: item.invoice || null,
      comments: item.comments || null,
    }));
  }

  validate() {
    return new Promise((resolve, reject) => {
      if (!this.token || !this.token.id || !this.token.email) {
        reject(new InputError('A valid token is required'));
      }
      if (!this.items || this.items.length === 0) {
        reject(new InputError('At least one item is required'));
      }
      const currency = this.items[0].currency;
      this.items.forEach(item => validateItem(item, currency));
      resolve();
    })
      .then(() => {
        const ids = Object.keys(this.items.reduce((set, item) => {
          const id = Number(item.person_id);
          if (id > 0 && CUSTOM_EMAIL_CATEGORIES.indexOf(item.category) === -1) set[id] = true;
          return set;
        }, {}));
        return ids.length === 0 ? null
          : this.db.many(`
              SELECT id, email, preferred_name(p) as name
                FROM People p
               WHERE id in ($1:csv)`, [ids]
            ).then(data => this.items.forEach(item => {
              const id = item.person_id;
              const pd = id && data.find(d => d.id === id);
              if (pd) {
                item.person_email = pd.email;
                if (!item.person_name) item.person_name = pd.name;
              }
            }));
      })
      .then(() => (this.items.every(item => purchaseData[item.category].allow_new_email)
        ? Promise.resolve()
        : this.db.many(`SELECT id FROM People WHERE email=$1`, this.token.email)
            .catch((error) => Promise.reject(error.message === 'No data returned from the query.'
              ? new InputError('Not a known email address: ' + JSON.stringify(this.token.email))
              : error
            ))
      ));
  }

  record() {
    const charges = this.items.map(item => item.stripe_charge_id).filter(c => c);
    if (charges.length) throw new Error('Payment already made? charge ids:' + charges);
    const sqlInsert = this.pgp.helpers.insert(this.items, Payment.fields, Payment.table);
    return this.db.many(`${sqlInsert} RETURNING id`)
      .catch(error => Promise.reject(error.message && error.message.indexOf('payments_person_id_fkey') !== -1
        ? new InputError('Not a valid person id: ' + error.detail)
        : error
      ))
      .then(ids => ids.forEach(({ id }, i) => this.items[i].id = id));
  }

  charge() {
    const amount = this.items.reduce((sum, item) => sum + item.amount, 0);
    const currency = this.items[0].currency;
    const labels = this.items.reduce((set, item) => {
      const typeData = purchaseData[item.category].types.find(type => type.key === item.type);
      const label = typeData && typeData.label || item.type;
      set[label] = (set[label] || 0) + 1;
      return set;
    }, {});
    const itemsDesc = Object.keys(labels)
      .map(label => labels[label] > 1 ? `${labels[label]}*${label}` : label)
      .join(', ');
    return stripe.charges.create({
      amount,
      currency,
      description: `Charge of €${amount/100} by ${this.token.email} for ${itemsDesc}`,
      metadata: { items: this.items.map(item => item.id).join(',') },
      receipt_email: this.token.email,
      source: this.token.id,
      statement_descriptor: Payment.statement_descriptor
    }).then(charge => {
      if (!charge.paid) throw new Error(`Charge not paid!? ${JSON.stringify(charge)}`);
      const paid = new Date(charge.created * 1000);
      const stripe_charge_id = charge.receipt_number || charge.id;
      const ids = this.items.map(item => {
        item.paid = paid;
        item.stripe_charge_id = stripe_charge_id;
        return item.id;
      });
      return this.db.none(`
        UPDATE ${Payment.table}
           SET paid=$(paid), stripe_charge_id=$(stripe_charge_id)
         WHERE id IN ($(ids:csv))`, { ids, paid, stripe_charge_id });
    });
  }

  process() {
    return this.validate()
      .then(() => this.record())
      .then(() => this.charge())
      .then(() => this.items)
      .catch(error => {
        const ids = this.items.map(item => item.id).filter(id => id);
        if (ids.length) {
          return this.db.none(`
            UPDATE ${Payment.table}
               SET error=$(msg)
             WHERE id IN ($(ids:csv))`, { ids, msg: error.message || error }
          ).then(() => { throw error; });
        } else {
          throw error;
        }
      });
  }

}

module.exports = Payment;
