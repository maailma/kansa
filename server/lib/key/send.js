const { InputError } = require('@kansa/common/errors')
const { sendMail } = require('@kansa/common/mail')
const refreshKey = require('./refresh')
const setKey = require('./set')

module.exports = function sendKey(req, db) {
  const { email: reqEmail, name, path, reset } = req.body
  if (!reqEmail) {
    const msg = 'An email address is required for sending its key!'
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
