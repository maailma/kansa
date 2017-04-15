const randomstring = require('randomstring');

const { InputError, isNoDataError } = require('./errors');
const sendEmail = require('./kyyhky-send-email');
const LogEntry = require('./types/logentry');

module.exports = { getKeyChecked, setKeyChecked, setKey, setAllKeys };

function setKeyChecked(req, email) {
  const key = randomstring.generate(12);
  const log = new LogEntry(req, 'Set access key');
  log.author = email;
  return req.app.locals.db.tx(tx => tx.batch([
    tx.none(`INSERT INTO Keys (email, key) VALUES ($(email), $(key))
        ON CONFLICT (email) DO UPDATE SET key = EXCLUDED.key`, { email, key }),
    tx.none(`INSERT INTO Log ${log.sqlValues}`, log)
  ]))
    .then(() => ({ email, key, set: true }));
}

function getKeyChecked(req, email) {
  return req.app.locals.db.one('SELECT email, key FROM Keys WHERE email = $1', email)
    .catch(() => setKeyChecked(req, email));
}

function setKey(req, res, next) {
  const { email, name, path, reset } = req.body;
  if (!email) return next(new InputError('An email address is required for setting its key!'));
  const db = req.app.locals.db;
  db.many('SELECT email FROM People WHERE email ILIKE $1', email)
    .then(data => reset
      ? setKeyChecked(req, data[0].email)
      : getKeyChecked(req, data[0].email))
    .then(({ email, key, set }) => sendEmail('kansa-set-key', { email, key, path, set })
      .then(() => res.json({ status: 'success', email }))
    )
    .catch(error => {
      if (!isNoDataError(error)) return next(error);
      if (!name) return next(new InputError(
        'Email address ' + JSON.stringify(email) + ' not found'
      ));
      db.one(`
        INSERT INTO People (membership, legal_name, email)
             VALUES ('NonMember', $(name), $(email))
          RETURNING email`, { email, name }
      )
        .then(({ email }) => setKeyChecked(req, email))
        .then(({ email, key }) => sendEmail('kansa-create-account', { email, key, name, path })
          .then(() => res.json({ status: 'success', email }))
        )
        .catch(next)
    });
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
