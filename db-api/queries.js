const options = { promiseLib: require('bluebird') };
const pgp = require('pg-promise')(options);
require('pg-monitor').attach(options);
const db = pgp('postgres://localhost:5432/worldcon75');

module.exports = { getLog, getEveryone, getSinglePerson, addPerson, updatePuppy, removePuppy };

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
  // CREATE TABLE IF NOT EXISTS Transactions (
  //     id SERIAL PRIMARY KEY,
  //     "timestamp" timestamptz NOT NULL,
  //     client_info text NOT NULL,
  //     author_id integer REFERENCES People NOT NULL,
  //     target_id integer REFERENCES People NOT NULL,
  //     action text NOT NULL,
  //     parameters jsonb NOT NULL,
  //     description text NOT NULL
  // );

  static get fields() {
    return [
      'timestamp', 'client_info',
      'author_id', 'target_id',
      'action', 'parameters',
      'description'
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
    this.author_id = null;  // required
    this.target_id = null;  // required
    this.action = req.method + ' ' + req.originalUrl;
    this.parameters = req.body;
    this.description = desc;
  }

  set authorId(src) { this.author_id = parseInt(src); }

  set targetId(src) { this.target_id = parseInt(src); }

  get targetId() { return this.target_id; }
}

class Person {
  // CREATE TABLE IF NOT EXISTS People (
  //     id SERIAL PRIMARY KEY,
  //     controller_id integer REFERENCES People,
  //     member_number integer,
  //     legal_name text NOT NULL,
  //     public_first_name text,
  //     public_last_name text,
  //     email text,
  //     city text,
  //     state text,
  //     country text,
  //     badge_text text,
  //     membership MembershipStatus NOT NULL,
  //     can_hugo_nominate bool NOT NULL DEFAULT false,
  //     can_hugo_vote bool NOT NULL DEFAULT false,
  //     can_site_select bool NOT NULL DEFAULT false
  // );

  static get fields() {
    return [
      'legal_name',
      'membership',
      'member_number',
      'controller_id',
      'public_first_name', 'public_last_name',
      'email',
      'city', 'state', 'country',
      'badge_text',
      'can_hugo_nominate', 'can_hugo_vote', 'can_site_select'
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
      log.targetId = data.id;
      return tx.none(`INSERT INTO Transactions ${LogEntry.sqlValues}`, log);
  }}))
  .then(() => {
    res.status(200)
      .json({
        status: 'success',
        message: 'Added one person',
        id: log.targetId
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
