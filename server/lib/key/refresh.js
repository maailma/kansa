const getKeyMaxAge = require('./max-age')
const setKey = require('./set')

module.exports = function refreshKey(req, db, email) {
  return db.task(async ts => {
    const maxAge = await getKeyMaxAge(ts, email)
    const data = await ts.oneOrNone(
      `UPDATE keys SET expires = now() + $(maxAge) * interval '1 second'
      WHERE email = $(email)
      RETURNING email, key`,
      { email, maxAge }
    )
    return data || setKey(req, ts, { email, maxAge })
  })
}
