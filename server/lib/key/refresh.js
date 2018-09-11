const getKeyMaxAge = require('./max-age')
const setKey = require('./set')

module.exports = function refreshKey(db, config, req, email) {
  return db.task(async ts => {
    const maxAge = await getKeyMaxAge(ts, config, email)
    const data = await ts.oneOrNone(
      `UPDATE keys SET expires = now() + $(maxAge) * interval '1 second'
      WHERE email = $(email)
      RETURNING email, key`,
      { email, maxAge }
    )
    return data || setKey(ts, config, req, { email, maxAge })
  })
}
