const fetch = require('node-fetch');
const randomstring = require('randomstring');

const LogEntry = require('./types/logentry');

module.exports = { setKey, setAllKeys };

function setKeyChecked(req, res, next, email) {
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
        data: { email, key },
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
    req.app.locals.db.any('SELECT email FROM People WHERE email ILIKE $1', req.body.email)
      .then(data => {
        if (data && data.length > 0) setKeyChecked(req, res, next, data[0].email);
        else res.status(400).json({
          status: 'error',
          message: 'Email address ' + JSON.stringify(req.body.email) + ' not found'
        });
      })
      .catch(err => next(err));
  }
}

function setAllKeys(req, res, next) {
  req.app.locals.db.many(`
       SELECT DISTINCT p.email
         FROM People p
    LEFT JOIN Keys k
           ON p.email = k.email
        WHERE k.email IS NULL`
  )
    .then(data => req.app.locals.db.tx(tx => tx.sequence((i) => data[i]
      ? tx.any('INSERT INTO Keys (email, key) VALUES ($(email), $(key))', {
          email: data[i].email,
          key: randomstring.generate(12)
        })
      : undefined
    )))
    .then(() => res.status(200).json({ status: 'success' }))
    .catch(err => next(err));
}
