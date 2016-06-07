const options = { promiseLib: require('bluebird') };
const pgp = require('pg-promise')(options);
require('pg-monitor').attach(options);
const db = pgp(process.env.DATABASE_URL);

module.exports = { setKey, getLog, getEveryone, getSinglePerson, addPerson, updatePuppy, removePuppy };

function setKey(req, res, next) {
  const randomstring = require('randomstring');
  if (!req.body.email) {
    next({ message: 'email is required for setting key!' });
    return;
  }
  db.one('SELECT DISTINCT email FROM People WHERE email=$(email)', req.body)
    .then(data => {
      data.key = randomstring.generate(12);
      db.none(`INSERT INTO Keys (email, key)
          VALUES ($(email), $(key))
          ON CONFLICT (email) DO UPDATE SET key = EXCLUDED.key`, data)
        .then(() => {
          res.status(200)
            .json({
              status: 'success',
              message: 'Key set for ' + JSON.stringify(data.email)
            });
        })
        .catch(err => next(err));
    })
    .catch(err => next(err));
}

function getLog(req, res, next) {
  db.any('SELECT * FROM Transactions')
    .then(data => {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved ALL transactions'
        });
    })
    .catch(err => next(err));
}

function getEveryone(req, res, next) {
  db.any('SELECT * FROM People')
    .then(data => {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved EVERYONE'
        });
    })
    .catch(err => next(err));
}

function getSinglePerson(req, res, next) {
  const id = parseInt(req.params.id);
  db.one('SELECT * FROM People WHERE id = $1', id)
    .then(data => {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved ONE person'
        });
    })
    .catch(err => next(err));
}

function forceBool(obj, prop) {
  const src = obj[prop];
  if (obj.hasOwnProperty(prop) && typeof src !== 'boolean') {
    if (src) {
      const s = src.trim().toLowerCase();
      obj[prop] = (s !== '' && s !== '0' && s !== 'false');
    } else {
      obj[prop] = false;
    }
  }
}

function forceInt(obj, prop) {
  const src = obj[prop];
  if (obj.hasOwnProperty(prop) && !Number.isInteger(src)) {
    obj[prop] = src ? parseInt(src) : null;
  }
}

class LogEntry {
  static get fields() {
    return [
      // id SERIAL PRIMARY KEY
      'timestamp',  // timestamptz NOT NULL
      'client_info',  // text NOT NULL
      'author',  // text
      'subject',  // integer REFERENCES People
      'action',  // text NOT NULL
      'parameters',  // jsonb NOT NULL
      'description'  // text NOT NULL
    ];
  }

  static get sqlValues() {
    const fields = LogEntry.fields;
    const values = fields.map(fn => `$(${fn})`).join(', ');
    return `(${fields.join(', ')}) VALUES(${values})`;
  }

  constructor(req, desc = '') {
    this.timestamp = new Date().toISOString();
    this.client_info = req.ip || 'no-IP';
    const ua = req.headers['User-Agent'];
    if (ua) this.client_info += '\t' + ua;
    this.author = null;
    this.subject = null;
    this.action = req.method + ' ' + req.originalUrl;
    this.parameters = req.body;
    this.description = desc;
  }
}

class Person {
  static get fields() {
    return [
      // id SERIAL PRIMARY KEY
      'legal_name',  // text NOT NULL
      'membership',  // MembershipStatus NOT NULL
      'member_number',  // integer
      'controller_id',  // integer REFERENCES People
      'public_first_name', 'public_last_name',  // text
      'email',  // text
      'city', 'state', 'country',  // text
      'badge_text',  // text
      'can_hugo_nominate', 'can_hugo_vote', 'can_site_select'  // bool NOT NULL DEFAULT false
    ];
  }

  static get boolFields() {
    return [ 'can_hugo_nominate', 'can_hugo_vote', 'can_site_select' ];
  }

  static get intFields() {
    return [ 'member_number', 'controller_id' ];
  }

  static get membershipTypes() {
    return [ 'NonMember', 'Supporter', 'KidInTow', 'Child', 'Youth',
             'FirstWorldcon', 'Adult' ];
  }

  constructor(src) {
    if (!src || !src.legal_name || !src.membership) throw new Error('Missing data for new Person (required: legal_name, membership)');
    if (Person.membershipTypes.indexOf(src.membership) === -1) throw new Error('Invalid membership type for new Person');
    this.data = Object.assign({}, src);
    Person.boolFields.forEach(fn => forceBool(this, fn));
    Person.intFields.forEach(fn => forceInt(this, fn));
  }

  get sqlValues() {
    const fields = Person.fields.filter(fn => this.data.hasOwnProperty(fn));
    const values = fields.map(fn => `$(${fn})`).join(', ');
    return `(${fields.join(', ')}) VALUES(${values})`;
  }
}

function addPerson(req, res, next) {
  try {
    var log = new LogEntry(req, 'Add new person');
    var person = new Person(req.body);
  } catch (e) {
    next({ message: e.message, err: e, log });
  }
  db.tx(tx => tx.sequence((index, data) => { switch (index) {
    case 0:
      return tx.one(`INSERT INTO People ${person.sqlValues} RETURNING id`, person.data);
    case 1:
      log.subject = parseInt(data.id);
      return tx.none(`INSERT INTO Transactions ${LogEntry.sqlValues}`, log);
  }}))
  .then(() => {
    res.status(200)
      .json({
        status: 'success',
        message: 'Added one person',
        id: log.subject
      });
  })
  .catch(err => next(err));
}

function updatePuppy(req, res, next) {
  db.none('update pups set name=$1, breed=$2, age=$3, sex=$4 where id=$5',
    [req.body.name, req.body.breed, parseInt(req.body.age),
      req.body.sex, parseInt(req.params.id)])
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Updated puppy'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function removePuppy(req, res, next) {
  var pupID = parseInt(req.params.id);
  db.result('delete from pups where id = $1', pupID)
    .then(function (result) {
      /* jshint ignore:start */
      res.status(200)
        .json({
          status: 'success',
          message: `Removed ${result.rowCount} puppy`
        });
      /* jshint ignore:end */
    })
    .catch(function (err) {
      return next(err);
    });
}
