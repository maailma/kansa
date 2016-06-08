const db = require('./db');
const auth = require('./auth');
const LogEntry = require('./lib/logentry');
const Person = require('./lib/person');

module.exports = {
  setKey: auth.setKey,
  getLog,
  getEveryone, getSinglePerson, addPerson,
  updatePuppy, removePuppy
};

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

function addPerson(req, res, next) {
  try {
    var log = new LogEntry(req, null, 'Add new person');
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
