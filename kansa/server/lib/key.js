const fetch = require('node-fetch');
const randomstring = require('randomstring');

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
    req.app.locals.db.one('SELECT COUNT(*) FROM People WHERE email=$1', req.body.email)
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
