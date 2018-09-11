const randomstring = require('randomstring')
const LogEntry = require('@kansa/common/log-entry')
const { sendMail, updateMailRecipient } = require('@kansa/common/mail')
const getKeyMaxAge = require('./max-age')

module.exports = function resetKey(db, config, req, { email, path }) {
  return db
    .tx(async tx => {
      const key = randomstring.generate(12)
      const maxAge = await getKeyMaxAge(tx, config, email)
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
