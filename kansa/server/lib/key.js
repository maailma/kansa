const randomstring = require('randomstring');

const { InputError, isNoDataError } = require('./errors');
const { mailTask, updateMailRecipient } = require('./mail')
const LogEntry = require('./types/logentry');

module.exports = { getKeyChecked, setKeyChecked, setKey, setAllKeys };

function setKeyChecked(req, db, email, name) {
  const data = { email, key: randomstring.generate(12), set: true };
  return db.tx(tx => (
    tx.none(`
      INSERT INTO Keys (email, key) VALUES ($(email), $(key))
      ON CONFLICT (email) DO UPDATE SET key = EXCLUDED.key`, data
    ).then(() => {
      if (!name) return 'Set access key';
      return tx.none(`
        INSERT INTO People (membership, legal_name, email)
             VALUES ('NonMember', $1, $2)`, [name, email]
      ).then(() => 'Create non-member account')
    }).then(description => {
      const log = new LogEntry(req, description);
      log.author = email;
      return tx.none(`INSERT INTO Log ${log.sqlValues}`, log);
    }).then(() => updateMailRecipient(tx, email))
  )).then(() => data);
}

function getKeyChecked(req, db, email) {
  return db.task(ts => (
    ts.oneOrNone(
      'SELECT email, key FROM Keys WHERE email = $1', email
    ).then(data => data || setKeyChecked(req, ts, email))
  ))
}

function setKey(req, res, next) {
  const { email, name, path, reset } = req.body;
  if (!email) return next(new InputError('An email address is required for setting its key!'));
  req.app.locals.db.task(ts => (
    ts.many('SELECT email FROM People WHERE email ILIKE $1', email)
      .then(data => reset
        ? setKeyChecked(req, ts, data[0].email)
        : getKeyChecked(req, ts, data[0].email))
      .then(({ email, key, set }) => {
        res.json({ status: 'success', email })
        mailTask('kansa-set-key', { email, key, path, set })
      })
      .catch(error => {
        if (!isNoDataError(error)) return next(error);
        if (!name) return next(new InputError(
          'Email address ' + JSON.stringify(email) + ' not found'
        ));
        setKeyChecked(req, ts, email, name)
          .then(({ email, key }) => mailTask('kansa-create-account', { email, key, name, path }))
          .then(() => res.json({ status: 'success', email }))
          .catch(next)
      })
  ))
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
