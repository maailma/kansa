const randomstring = require('randomstring');

const db = require('./db');
const LogEntry = require('./lib/logentry');

function setKeyChecked(req, res, next) {
  const data = { email: req.body.email, key: randomstring.generate(12) };
  const log = new LogEntry(req, data.email, 'Set access key');
  db.tx(tx => tx.batch([
    tx.none(`INSERT INTO Keys (email, key) VALUES ($(email), $(key))
        ON CONFLICT (email) DO UPDATE SET key = EXCLUDED.key`, data),
    tx.none(`INSERT INTO Transactions ${LogEntry.sqlValues}`, log)
  ]))
    .then(() => { res.status(200).json({
      status: 'success',
      message: 'Key set for ' + JSON.stringify(data.email)
    })})
    .catch(err => next(err));
}

function setKey(req, res, next) {
  if (!req.body || !req.body.email) {
    res.status(400).json({
      status: 'error',
      message: 'An email address is required for setting its key!'
    });
  } else {
    db.one('SELECT COUNT(*) FROM People WHERE email=$1', req.body.email)
      .then(data => {
        if (data.count > 0) setKeyChecked(req, res, next);
        else res.status(400).json({
          status: 'error',
          message: 'Email address ' + JSON.stringify(req.body.email) + ' not found'
        });
      })
      .catch(err => next(err));
  }
}

module.exports = { setKey };
