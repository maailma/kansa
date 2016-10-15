const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const prices = require('../static/prices.json');

const InputError = require('./types/inputerror');
const LogEntry = require('./types/logentry');
const Payment = require('./types/payment');
const Person = require('./types/person');

const { addPerson } = require('./people');
const { upgradePerson } = require('./upgrade');

const STATEMENT_DESCRIPTOR = 'WORLDCON 75 MEMBERSHIP';

module.exports = { makePurchase };

function getUpgradesAmount(db, upgrades) {
  return (upgrades.length === 0) ? Promise.resolve(0) : db.any(
    `SELECT id, membership, paper_pubs
       FROM People
      WHERE id in ($1:csv)` +
    [upgrades.map(u => u.id)]
  ).then(data => upgrades.reduce((sum, upgrade) => {
    const prev = data.find(p => p.id === upgrade.id);
    if (!prev) throw new InputError('No upgradeable membership found! ' + JSON.stringify(upgrade));
    const price0 = prices[prev.membership] || { amount: 0 };
    const price1 = prices[upgrade.membership];
    if (!price1) throw new InputError('No price found for upgrade ' + JSON.stringify(upgrade));
    if (price1.amount < price0.amount) throw new InputError('Negative upgrade is not possible! ' + JSON.stringify(upgrade));
    sum += price1.amount - price0.amount;
    if (upgrade.paper_pubs && !prev.paper_pubs) sum += prices.paperPubs.amount;
    return sum;
  }, 0));
}

function getChargeDescription(newMembers, upgrades) {
  const ds = [];
  switch (newMembers.length) {
    case 0: break;
    case 1: ds.push(`New membership (${newMembers[0].data.membership})`); break;
    default: ds.push(`${newMembers.length} new memberships`)
  }
  switch (upgrades.length) {
    case 0: break;
    case 1: ds.push(`Membership upgrade (to ${upgrades[0].membership})`); break;
    default: ds.push(`${newMembers.length} membership upgrades`)
  }
  return ds.join(' and ');
}

function makePurchase(req, res, next) {
  const { email, id } = req.body.token || {};
  if (!email || !id) throw new InputError('Missing or invalid token!');
  const amount = Number(req.body.amount);
  if (!(amount > 0)) throw new InputError('Missing or invalid amount!');  // NaN comparisons are always false
  const newMembers = (req.body.new_members || []).map(p => new Person(p));
  const newMembersAmount = newMembers.reduce((sum, p) => {
    const price = prices[p.data.membership];
    if (!price) throw new InputError('No price found for new membership ' + JSON.stringify(p.data));
    sum += price.amount;
    if (p.data.paper_pubs) sum += prices.paperPubs.amount;
    return sum;
  }, 0);
  const upgrades = req.body.upgrades || [];
  if (newMembers.length === 0 && upgrades.length === 0) throw new InputError('Purchase needs at least one item!');
  getUpgradesAmount(req.app.locals.db, upgrades)
    .then(upgradesAmount => {
      if (newMembersAmount + upgradesAmount !== amount) {
        throw new InputError(`Price mismatch! Got ${amount}, expected ${newMembersAmount + upgradesAmount}`);
      }
      const charge = stripe.charges.create({
        amount,
        currency: 'eur',
        description: getChargeDescription(newMembers, upgrades),
        metadata: {
          email,
          newMembers: newMembers.map(p => p.data),
          upgrades
        },
        receipt_email: email,
        source: id,
        statement_descriptor: STATEMENT_DESCRIPTOR || null
      });  // will throw on failure
      const db = req.app.locals.db;
      const pLog = new LogEntry(req, 'New purchase');
      db.none(`INSERT INTO Log ${pLog.sqlValues}`, pLog)
        .then(() => Promise.all([
          Promise.all(newMembers.map(person => addPerson(req, db, person))),
          Promise.all(upgrades.map(upgrade => upgradePerson(req, db, upgrade)))
        ]))
        .then(res => res.status(200).json({ status: 'success', id }))  // HERE
        .catch(next);

      req.app.locals.db.tx(tx => tx.sequence((i, data) => {
        if (logEntry) {
          logEntry.subject = data && parseInt(data.id) || null;
          const res = tx.none(`INSERT INTO Log ${logEntry.sqlValues}`, logEntry);
          logEntry = null;
          return res;
        } else if (newMembers.length) {
          const person = newMembers.shift();
          logEntry = new LogEntry(req, 'Add new person');
          logEntry.parameters = person.data;
          return tx.one(`INSERT INTO People ${person.sqlValues} RETURNING id`, person.data);
        } else if (upgrades.length) {
        }
        case 1:
          return tx.one(`INSERT INTO People ${person.sqlValues} RETURNING id`, person.data);
        case 2:
          const log = new LogEntry(req, 'Add new person');
          id = log.subject = parseInt(data.id);
          return tx.none(`INSERT INTO Log ${log.sqlValues}`, log);
      }}))
        .then(() => { res.status(200).json({ status: 'success', id }); })

      // HERE: create charge, apply inserts & updates
    })
    .catch(err => next(err));

  /*
  let id, person, charge;
  try {
    person = new Person(req.body);
    charge = new Payment(req.body).charge();
  } catch (e) {
    return res.status(400).json({ status: 'error', message: e.message });
  }
  req.app.locals.db.tx(tx => tx.sequence((i, data) => { switch (i) {
    case 0:
      return tx.one(`INSERT INTO People ${person.sqlValues} RETURNING id`, person.data);
    case 1:
      const log = new LogEntry(req, 'Add new person');
      id = log.subject = parseInt(data.id);
      return tx.none(`INSERT INTO Log ${log.sqlValues}`, log);
  }}))
    .then(() => { res.status(200).json({ status: 'success', id }); })
    .catch(err => next(err));
  */
}
