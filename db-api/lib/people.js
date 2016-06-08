const LogEntry = require('./types/logentry');
const Person = require('./types/person');

module.exports = { getEveryone, getSinglePerson, addPerson };

function getEveryone(req, res, next) {
  req.app.locals.db.any('SELECT * FROM People')
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
  req.app.locals.db.one('SELECT * FROM People WHERE id = $1', id)
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
  req.app.locals.db.tx(tx => tx.sequence((index, data) => { switch (index) {
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
