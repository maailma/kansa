const randomstring = require('randomstring')
const LogEntry = require('@kansa/common/log-entry')
const { updateMailRecipient } = require('@kansa/common/mail')
const getKeyMaxAge = require('./max-age')

module.exports = function setKey(req, db, { email, maxAge, name }) {
  return db
    .tx(async tx => {
      if (!maxAge) maxAge = await getKeyMaxAge(tx, email)
      const key = randomstring.generate(12)
      await tx.none(
        `INSERT INTO Keys (email, key, expires)
        VALUES ($(email), $(key), now() + $(maxAge) * interval '1 second')
        ON CONFLICT (email) DO
          UPDATE SET key = EXCLUDED.key, expires = EXCLUDED.expires`,
        { email, key, maxAge }
      )
      let description = 'Set access key'
      if (name) {
        await tx.none(
          `INSERT INTO People (membership, legal_name, email)
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
