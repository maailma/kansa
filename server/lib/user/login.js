const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const { AuthError, InputError } = require('@kansa/common/errors')
const LogEntry = require('@kansa/common/log-entry')
const resetKey = require('../key/reset')

module.exports = function login(db, config, req) {
  const email = (req.body && req.body.email) || req.query.email
  const key = (req.body && req.body.key) || req.query.key
  if (!email || !key) {
    const msg = 'Email and key are required for login'
    return Promise.reject(new InputError(msg))
  }
  return db.task(async ts => {
    const user = await ts.oneOrNone(
      `SELECT
        k.email,
        k.expires IS NOT NULL AND k.expires < now() AS expired,
        ${config.auth.admin_roles.join(', ')}
      FROM kansa.Keys k
        LEFT JOIN admin.Admins a USING (email)
      WHERE email=$(email) AND key=$(key)`,
      { email, key }
    )
    if (!user) throw new AuthError(`Email and key don't match`)
    if (user.expired) {
      const path = req.body && req.body.path
      await resetKey(ts, config, req, { email, path })
      const error = new InputError('Expired key')
      error.status = 403
      throw error
    }
    req.session.user = user
    const token = await promisify(jwt.sign)(
      { scope: 'wsfs' },
      process.env.JWT_SECRET,
      {
        expiresIn: 120 * 60,
        subject: email
      }
    )
    await new LogEntry(req, 'Login').write(ts)
    return { email, token }
  })
}
