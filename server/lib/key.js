const randomstring = require('randomstring')

const config = require('./config')
const { InputError } = require('./errors')
const { mailTask, updateMailRecipient } = require('./mail')
const LogEntry = require('./types/logentry')

module.exports = {
  refreshKey,
  resetExpiredKey,
  setKeyChecked,
  setKey,
  setAllKeys
}

const getKeyMaxAge = (db, email) =>
  db
    .one(`SELECT exists(SELECT 1 FROM admin.admins WHERE email = $1)`, email)
    .then(({ exists: isAdmin }) => {
      const type = isAdmin ? 'admin' : 'normal'
      return config.auth.key_timeout[type] / 1000
    })

function refreshKey(req, db, email) {
  return db.task(async ts => {
    const maxAge = await getKeyMaxAge(ts, email)
    const data = await ts.oneOrNone(
      `
      UPDATE keys SET expires = now() + $(maxAge) * interval '1 second'
      WHERE email = $(email)
      RETURNING email, key`,
      { email, maxAge }
    )
    return data || setKeyChecked(req, ts, { email, maxAge })
  })
}

function resetExpiredKey(req, db, { email, path }) {
  return db.tx(async tx => {
    const key = randomstring.generate(12)
    const maxAge = await getKeyMaxAge(tx, email)
    await tx.none(
      `
      UPDATE keys SET key=$(key),
        expires = now() + $(maxAge) * interval '1 second'
      WHERE email = $(email)`,
      { email, key, maxAge }
    )
    const log = new LogEntry(req, 'Reset access key')
    log.author = email
    await tx.none(`INSERT INTO Log ${log.sqlValues}`, log)
    await updateMailRecipient(tx, email)
    await mailTask('kansa-set-key', { email, key, path })
  })
}

function setKeyChecked(req, db, { email, maxAge, name }) {
  return db.tx(async tx => {
    if (!maxAge) maxAge = await getKeyMaxAge(tx, email)
    const key = randomstring.generate(12)
    await tx.none(
      `
      INSERT INTO Keys (email, key, expires)
      VALUES ($(email), $(key), now() + $(maxAge) * interval '1 second')
      ON CONFLICT (email) DO
        UPDATE SET key = EXCLUDED.key, expires = EXCLUDED.expires`,
      { email, key, maxAge }
    )
    let description = 'Set access key'
    if (name) {
      await tx.none(
        `
        INSERT INTO People (membership, legal_name, email)
        VALUES ('NonMember', $1, $2)`,
        [name, email]
      )
      description = 'Create non-member account'
    }
    const log = new LogEntry(req, description)
    log.author = email
    await tx.none(`INSERT INTO Log ${log.sqlValues}`, log)
    await updateMailRecipient(tx, email)
    return { email, key, maxAge, set: true }
  })
}

function setKey(req, res, next) {
  const { email: reqEmail, name, path, reset } = req.body
  if (!reqEmail)
    return next(
      new InputError('An email address is required for setting its key!')
    )
  req.app.locals.db
    .task(async ts => {
      const rows = await ts.any(
        'SELECT email FROM People WHERE email ILIKE $1',
        reqEmail
      )
      if (rows.length > 0) {
        const { email } = rows[0]
        const { key, set } = reset
          ? await setKeyChecked(req, ts, { email })
          : await refreshKey(req, ts, email)
        await mailTask('kansa-set-key', { email, key, path, set })
        res.json({ status: 'success', email })
      } else {
        if (!name)
          return next(
            new InputError(`Email address ${JSON.stringify(email)} not found`)
          )
        const { email, key } = await setKeyChecked(req, ts, {
          email: reqEmail,
          name
        })
        await mailTask('kansa-create-account', { email, key, name, path })
        res.json({ status: 'success', email })
      }
    })
    .catch(next)
}

function setAllKeys(req, res, next) {
  req.app.locals.db
    .tx(async tx => {
      const data = await tx.any(`
      SELECT DISTINCT p.email, a.email IS NOT NULL AS is_admin
      FROM people p
        LEFT JOIN keys k USING (email)
        LEFT JOIN admin.admins a USING (email)
      WHERE k.email IS NULL`)
      const kt = config.auth.key_timeout
      await tx.sequence(i => {
        if (!data[i]) return undefined
        const { email, is_admin } = data[i]
        const key = randomstring.generate(12)
        const maxAge = (is_admin ? kt.admin : kt.normal) / 1000
        return tx.any(
          `
        INSERT INTO Keys (email, key, expires)
        VALUES ($(email), $(key), now() + $(maxAge) * interval '1 second')`,
          { email, key, maxAge }
        )
      })
      res.json({ status: 'success', count: data.length })
    })
    .catch(next)
}
