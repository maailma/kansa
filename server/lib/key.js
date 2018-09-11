const randomstring = require('randomstring')
const config = require('@kansa/common/config')
const { InputError } = require('@kansa/common/errors')
const LogEntry = require('@kansa/common/log-entry')
const { sendMail, updateMailRecipient } = require('@kansa/common/mail')

module.exports = {
  refreshKey,
  resetExpiredKey,
  setKey,
  sendKey
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
    return data || setKey(req, ts, { email, maxAge })
  })
}

function resetExpiredKey(req, db, { email, path }) {
  return db
    .tx(async tx => {
      const key = randomstring.generate(12)
      const maxAge = await getKeyMaxAge(tx, email)
      await tx.none(
        `UPDATE keys
        SET key=$(key), expires = now() + $(maxAge) * interval '1 second'
        WHERE email = $(email)`,
        { email, key, maxAge }
      )
      const log = new LogEntry(req, 'Reset access key')
      log.author = email
      await log.write(tx)
      return key
    })
    .then(async key => {
      await updateMailRecipient(db, email)
      return sendMail('kansa-set-key', { email, key, path })
    })
}

function setKey(req, db, { email, maxAge, name }) {
  return db
    .tx(async tx => {
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
      await log.write(tx)
      return { key, maxAge }
    })
    .then(async ({ key, maxAge }) => {
      await updateMailRecipient(db, email)
      return { email, key, maxAge, set: true }
    })
}

function sendKey(req, db) {
  const { email: reqEmail, name, path, reset } = req.body
  if (!reqEmail) {
    const msg = 'An email address is required for setting its key!'
    return Promise.reject(new InputError(msg))
  }
  let msgTmpl
  return db
    .task(async ts => {
      const rows = await ts.any(
        'SELECT email FROM People WHERE email ILIKE $1',
        reqEmail
      )
      if (rows.length > 0) {
        const { email } = rows[0]
        const { key, set } = reset
          ? await setKey(req, ts, { email })
          : await refreshKey(req, ts, email)
        msgTmpl = 'kansa-set-key'
        return { email, key, path, set }
      }
      if (!name) {
        const msg = `Email address ${JSON.stringify(email)} not found`
        throw new InputError(msg)
      }
      const { email, key } = await setKey(req, ts, {
        email: reqEmail,
        name
      })
      msgTmpl = 'kansa-create-account'
      return { email, key, name, path }
    })
    .then(async data => {
      await sendMail(msgTmpl, data)
      return data.email
    })
}
