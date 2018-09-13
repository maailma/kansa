const { AuthError, InputError } = require('@kansa/common/errors')
const isTrueish = require('@kansa/common/trueish')

module.exports = function logout(db, req) {
  const data = Object.assign({}, req.query, req.body)
  const opt = isTrueish(data.reset)
    ? 'reset'
    : isTrueish(data.all)
      ? 'all'
      : null
  // null: log out this session only, 'all': log out all sessions, 'reset': also reset/forget login key
  const { user } = req.session
  if (data.email) {
    if (!user.admin_admin) return Promise.reject(new AuthError())
    if (!opt) {
      const msg = 'If email is set, either all=1 or reset=1 is also required'
      return Promise.reject(new InputError(msg))
    }
    if (data.email === user.email) delete req.session.user
  } else {
    delete req.session.user
    if (!opt) return Promise.resolve({ email: user.email })
  }
  const email = data.email || user.email
  return db.task(async ts => {
    const data = await ts.any(
      `DELETE FROM "session" WHERE sess #>> '{user, email}' = $1 RETURNING sid`,
      email
    )
    if (opt === 'reset')
      await ts.none(`DELETE FROM Keys WHERE email = $1`, email)
    return { email, opt, sessions: data[0].length }
  })
}
