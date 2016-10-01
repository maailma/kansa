const fetch = require('node-fetch');
const randomstring = require('randomstring');

const Person = require('./types/person');
const LogEntry = require('./types/logentry');

module.exports = { setKey };

function loginUri(email, key) {
  const root = process.env.LOGIN_URI_ROOT;
  return encodeURI(`${root}/${email}/${key}`);
}

function setKeyChecked(req, res, next) {
  const email = req.body.email;
  const key = randomstring.generate(12);
  const log = new LogEntry(req, 'Set access key');
  log.author = email;
  req.app.locals.db.tx(tx => tx.batch([
    tx.none(`INSERT INTO Keys (email, key) VALUES ($(email), $(key))
        ON CONFLICT (email) DO UPDATE SET key = EXCLUDED.key`, { email, key }),
    tx.none(`INSERT INTO Log ${log.sqlValues}`, log)
  ]))
    .then(() => fetch('http://kyyhky:3000/job', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'kansa-set-key',
        data: {
          email,
          uri: loginUri(email, key)
        },
        options: {
          searchKeys: []
        }
      })
    }))
    .then(() => res.status(200).json({ status: 'success', email }))
    .catch(next);
}

function setKey(req, res, next) {
  if (!req.body || !req.body.email) {
    res.status(400).json({
      status: 'error',
      message: 'An email address is required for setting its key!'
    });
  } else {
    const person = new Person({
      email: req.body.email,
      legal_name: req.body.email,
      membership: 'NonMember',
      can_hugo_nominate: true
    });
    req.app.locals.db.none(`INSERT INTO People ${person.sqlValues} ON CONFLICT DO NOTHING`, person.data)
      .then(() => setKeyChecked(req, res, next))
      .catch(err => next(err));
  }
}
