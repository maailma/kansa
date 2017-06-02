const Promise = require('bluebird');
const randomstring = require('randomstring');
const Stripe = require('stripe');

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
  if (item.id) return;
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
  if (item.status === 'invoice' && (item.stripe_charge_id || item.stripe_receipt || item.stripe_token)) {
    throw new InputError('Invoice items cannot have associated payment data');
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
    'updated', 'payment_email', 'status', 'amount', 'currency',
    'stripe_charge_id', 'stripe_receipt', 'stripe_token',
    'person_id', 'person_name', 'category', 'type', 'data',
    'invoice', 'comments'
  ]}

  // https://stripe.com/docs/api/node#create_charge-statement_descriptor
  // max 22 chars
  static get statement_descriptor() { return 'Worldcon 75 membership'; }

  static get table() { return 'payments'; }

  constructor(pgp, db, account, email, source, items) {
    this.pgp = pgp;
    this.db = db;
    this.account = account || 'default';
    this.email = email;
    this.source = source;
    this.items = items.map(item => ({
      id: item.id || null,
      updated: null,
      payment_email: email,
      status: source ? 'chargeable' : 'invoice',
      stripe_charge_id: null,
      stripe_receipt: null,
      stripe_token: source && source.id || null,
      amount: Number(item.amount),
      currency: item.currency || 'eur',
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

  get stripe() {
    let keyvar = 'STRIPE_SECRET_APIKEY'
    if (this.account !== 'default') keyvar += '_' + this.account
    const key = process.env[keyvar]
    return new Stripe(key)
  }

  validate() {
    return new Promise((resolve, reject) => {
      if (!this.email) {
        reject(new InputError('A valid email is required'));
      } else if (this.source && !this.source.id) {
        reject(new InputError('A valid source is required'));
      } else if (!this.items || this.items.length === 0) {
        reject(new InputError('At least one item is required'));
      } else {
        const currency = this.items[0].currency;
        this.items.forEach(item => validateItem(item, currency));
        resolve();
      }
    })
      .then(() => {
        const itemIds = this.items.map(it => it.id).filter(id => id)
        return itemIds.length === 0 ? null : this.db.many(`
          SELECT a.id, a.status, amount, currency, person_id,
                 a.category, a.type, a.data, a.invoice,
                 p.email AS person_email, preferred_name(p) as person_name
            FROM Payments a LEFT JOIN People p ON (person_id = p.id)
           WHERE a.id in ($1:csv)`, [itemIds]
        ).then(dbItems => {
          dbItems.forEach(dbItem => {
            const item = this.items.find(item => item.id === dbItem.id)
            Object.assign(item, dbItem)
          })
          const notFound = this.items.find(item => !item.type)
          if (notFound) throw new Error('Payment not found: ' + JSON.stringify(notFound))
        })
      })
      .then(() => {
        const personIds = Object.keys(this.items.reduce((set, item) => {
          const id = Number(item.person_id);
          if (id > 0 && !item.person_email &&
            CUSTOM_EMAIL_CATEGORIES.indexOf(item.category) === -1
          ) set[id] = true;
          return set;
        }, {}));
        return personIds.length === 0 ? null
          : this.db.many(`
              SELECT id, email, preferred_name(p) as name
                FROM People p
               WHERE id in ($1:csv)`, [personIds]
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
        : this.db.many(`SELECT id FROM People WHERE email=$1`, this.email)
            .catch((error) => Promise.reject(error.message === 'No data returned from the query.'
              ? new InputError('Not a known email address: ' + JSON.stringify(this.email))
              : error
            ))
      ));
  }

  record() {
    const charges = this.items.map(item => item.stripe_charge_id).filter(c => c);
    if (charges.length) throw new Error('Payment already made? charge ids:' + charges);
    const newItems = this.items.filter(item => !item.id);
    if (newItems.length === 0) return null
    const sqlInsert = this.pgp.helpers.insert(newItems, Payment.fields, Payment.table);
    return this.db.many(`${sqlInsert} RETURNING id`)
      .catch(error => Promise.reject(error.message && error.message.indexOf('payments_person_id_fkey') !== -1
        ? new InputError('Not a valid person id: ' + error.detail)
        : error
      ))
      .then(ids => ids.forEach(({ id }, i) => newItems[i].id = id));
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
    return this.stripe.charges.create({
      amount,
      currency,
      description: `Charge of €${amount/100} by ${this.email} for ${itemsDesc}`,
      metadata: { items: this.items.map(item => item.id).join(',') },
      receipt_email: this.email,
      source: this.source.id,
      statement_descriptor: Payment.statement_descriptor
    }).then(charge => {
      const _charge = {
        updated: new Date(charge.created * 1000),
        status: charge.status,
        stripe_receipt: charge.receipt_number,
        stripe_charge_id: charge.id
      }
      _charge.items = this.items.map(item => {
        Object.assign(item, _charge);
        return item.id;
      });
      return this.db.none(`
        UPDATE ${Payment.table}
           SET updated=$(updated), status=$(status),
               stripe_charge_id=$(stripe_charge_id),
               stripe_receipt=$(stripe_receipt)
         WHERE id IN ($(items:csv))`, _charge);
    });
  }

  process() {
    return this.validate()
      .then(() => this.record())
      .then(() => this.source && this.charge())
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
