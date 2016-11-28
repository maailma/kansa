const stripe = require('stripe')(process.env.STRIPE_SECRET_APIKEY);

const membershipPrices = require('../static/prices.json');
const { InputError } = require('./errors');
const LogEntry = require('./types/logentry');
const Person = require('./types/person');
const { addPerson } = require('./people');
const { upgradePerson } = require('./upgrade');

// https://stripe.com/docs/api/node#create_charge-statement_descriptor
const statement_descriptor = 'Worldcon 75 membership'; // max 22 chars

function calcAmount(newMembers, upgrades) {
  const ppa = membershipPrices.PaperPubs.amount;
  const sumNew = newMembers.reduce((sum, m) => {
    const ms = membershipPrices[m.data.membership];
    if (!ms) throw new InputError(`No price found for ${JSON.stringify(m.data.membership)} membership`);
    return sum + ms.amount + (m.data.paper_pubs ? ppa : 0);
  }, 0);
  const sumUpgrades = upgrades.reduce((sum, u) => {
    const ms0 = membershipPrices[u.prev_membership];
    const ms1 = membershipPrices[u.membership];
    return sum + ms1.amount - (ms0 ? ms0.amount : 0) + (u.paper_pubs ? ppa : 0);
  }, 0);
  return sumNew + sumUpgrades;
}

function logMessage(newMembers, upgrades) {
  const ma = [];
  switch (newMembers.length) {
    case 0: break;
    case 1: ma.push('1 new membership'); break;
    default: ma.push(`${newMembers.length} new memberships`);
  }
  switch (upgrades.length) {
    case 0: break;
    case 1: ma.push('1 membership upgrade'); break;
    default: ma.push(`${upgrades.length} membership upgrades`);
  }
  const pp = newMembers.filter(m => m.data.paper_pubs).length + upgrades.filter(u => u.paper_pubs).length;
  if (pp) ma.push(`${pp} paper publications`);
  return ma.join(', ');
}

function uniqueEmails(newMembers, upgrades) {
  const emails = {};
  newMembers.forEach(m => { emails[m.data.email] = true; });
  upgrades.forEach(u => { emails[u.email] = true; });
  return Object.keys(emails);
}


class Purchase {
  constructor(pgp, db) {
    this.pgp = pgp;
    this.db = db;
    this.makePurchase = this.makePurchase.bind(this);
  }

  checkUpgrades(reqUpgrades) {
    if (reqUpgrades.length === 0) return Promise.resolve([]);
    return this.db.any(`
      SELECT id, email, membership, paper_pubs
        FROM People
       WHERE id IN ($1:csv)`, [reqUpgrades.map(u => u.id)]
    ).then(prevData => {
      if (prevData.length !== reqUpgrades.length) throw new InputError(
        `Error in upgrades: found ${prevData.length} of ${reqUpgrades.length} memberships`
      );
      return reqUpgrades.map(upgrade => {
        const prev = prevData.find(m => m.id === upgrade.id);
        if (!prev) throw new InputError(`Previous membership not found for ${JSON.stringify(upgrade)}`);
        const ti0 = Person.membershipTypes.indexOf(prev.membership);
        const ti1 = Person.membershipTypes.indexOf(upgrade.membership);
        if (ti1 <= ti0) throw new InputError(
          `Can't "upgrade" from ${JSON.stringify(prev.membership)} to ${JSON.stringify(upgrade.membership)}`
        );
        if (upgrade.paper_pubs && prev.paper_pubs) throw new InputError(
          `Error in upgrades: ${JSON.stringify(upgrade)} already has paper pubs!`
        );
        return Object.assign({}, upgrade, {
          email: prev.email,
          paper_pubs: Person.cleanPaperPubs(upgrade.paper_pubs),
          prev_membership: prev.membership
        });
      });
    });
  }

  stripeCharge({ req, token, amount, email, msg }) {
    const description = `Charge of €${amount/100} by ${email} for ${msg}`;
    const preLogEntry = new LogEntry(req, description);
    return this.db.none(
      `INSERT INTO Log ${preLogEntry.sqlValues}`, preLogEntry
    ).then(() => stripe.charges.create({
        amount,
        currency: 'eur',
        description,
        metadata: { email },
        receipt_email: email,
        source: token,
        statement_descriptor
    })).then((charge) => {
      if (!charge.paid) throw new Error(`Charge not paid! WTF? ${JSON.stringify(charge)}`);
      const id = charge.receipt_number || charge.id;
      const postLogEntry = new LogEntry(req, `Charge ok: ${id}`);
      postLogEntry.parameters = charge;
      return this.db.none(`INSERT INTO Log ${postLogEntry.sqlValues}`, postLogEntry);
    }).catch(error => {
      const errLogEntry = new LogEntry(req, `Charge failed! ${error.message}`);
      errLogEntry.parameters = error;
      this.db.none(`INSERT INTO Log ${errLogEntry.sqlValues}`, errLogEntry);
      throw error;
    });
  }

  makePurchase(req, res, next) {
    const amount = Number(req.body.amount);
    const email = req.body.email;
    const token = req.body.token;
    if (!amount || !email || !token) return next(
      new InputError('Required parameters: amount, email, token')
    );
    const newMembers = (req.body.new_members || []).map(src => new Person(src));
    const reqUpgrades = req.body.upgrades || [];
    if (newMembers.length === 0 && reqUpgrades.length === 0) return next(
      new InputError('Non-empty new_members or upgrades is required')
    );
    let upgrades;
    this.checkUpgrades(reqUpgrades).then(_upgrades => {
      upgrades = _upgrades;
      const ca = calcAmount(newMembers, upgrades);
      if (amount !== ca) throw new InputError(`Amount mismatch: in request ${amount}, calculated ${ca}`);
      const msg = logMessage(newMembers, upgrades);
      return this.stripeCharge({ req, token, amount, email, msg });
    }).then(() => Promise.all(
      upgrades.map(u => upgradePerson(req, this.db, u))
    )).then(() => Promise.all(
      newMembers.map(m => addPerson(req, this.db, m))
    )).then(() => {
      const emails = uniqueEmails(newMembers, upgrades);
      res.status(200).json({ status: 'success', emails });
    }).catch(next);
  }
}

module.exports = Purchase;
