const promiseLib = require('bluebird');
const pgp = require('pg-promise')({ promiseLib });
const db = pgp('postgres://localhost:5432/worldcon75');

module.exports = { getEveryone, getSinglePerson, addPerson, updatePuppy, removePuppy };

function getEveryone(req, res, next) {
  db.any('select * from People')
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
  db.one('select * from People where id = $1', id)
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

class LogEntry {
  constructor(req, desc = '') {
    this.timestamp = new Date().toISOString();
    this.client = req.ip || 'no-IP';
    const ua = req.headers['User-Agent'];
    if (ua) this.client += '\t' + ua;
    //Author ID — Required person ID. The author of the transaction.
    //Target ID — Required person ID. The target of the transaction.
    this.action = req.method + ' ' + req.originalUrl;
    this.params = req.body;
    this.description = desc;
  }
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

  constructor(src) {
    if (!src || !src.legal_name || !src.membership) throw new Error('Missing data for new Person (required: legal_name, membership)');
    if (Person.membershipTypes.indexOf(src.membership) === -1) throw new Error('Invalid membership type for new Person');
    this.data = Object.assign({}, src);
    Person.boolFields.forEach(fn => this.forceBool(fn));
    Person.intFields.forEach(fn => this.forceInt(fn));
  }

  static get allFields() {
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

  forceBool(fn) {
    if (this.data.hasOwnProperty(fn)) {
      const str2bool = src => {
        if (!src) return false;
        const s = src.trim().toLowerCase();
        return s !== '' && s !== '0' && s !== 'false';
      };
      this.data[fn] = str2bool(this.data[fn]);
    }
  }

  forceInt(fn) {
    if (this.data.hasOwnProperty(fn)) {
      const src = this.data[fn];
      this.data[fn] = src ? parseInt(src) : null;
    }
  }

  get fields() {
    return Person.allFields.filter(fn => this.data.hasOwnProperty(fn));
  }

  get valuesString() {
    const names = this.fields.join(', ');
    const values = this.fields.map(fn => `$(${fn})`).join(', ');
    return `(${names}) values(${values})`;
  }
}

function addPerson(req, res, next) {
  // TODO: generate log entry before person
  try {
    const p = new Person(req.body);
    db.one(`insert into People ${p.valuesString} returning id`, p.data)
      .then(data => {
        res.status(200)
          .json({
            status: 'success',
            data,
            message: 'Added one person'
          });
      })
      .catch(err => next(err));
  } catch (e) {
    next({
      message: e.message,
      err: e,
      req_body: req.body
    });
  }
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
