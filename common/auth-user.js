const { AuthError, InputError } = require('./errors')

module.exports = { isSignedIn, hasRole, matchesId }

function isSignedIn(req, res, next) {
  const { user } = req.session
  if (user && user.email) next()
  else next(new AuthError())
}

function hasRole(role) {
  return function _hasRole(req, res, next) {
    const { user } = req.session
    if (user && user.email) {
      if (Array.isArray(role)) {
        if (role.some(r => user[r])) return next()
      } else {
        if (user[role]) return next()
      }
    }
    next(new AuthError())
  }
}

function matchesId(db, req, role) {
  const id = parseInt(req.params.id)
  const { user } = req.session
  if (isNaN(id) || id < 0)
    return Promise.reject(new InputError('Bad id number'))
  if (!user || !user.email) return Promise.reject(new AuthError())
  if ((Array.isArray(role) && role.some(r => user[r])) || (role && user[role]))
    return Promise.resolve(id)
  return db
    .oneOrNone('SELECT email FROM people WHERE id = $1', id)
    .then(data => {
      if (data && user.email === data.email) return id
      throw new AuthError()
    })
}
