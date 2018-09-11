const randomstring = require('randomstring')
const { InputError } = require('@kansa/common/errors')
const isTrueish = require('@kansa/common/trueish')

module.exports = { getAdmins, setAdmin, setAllKeys }

function getAdmins(db) {
  return db.any('SELECT * FROM admin.Admins')
}

function setAdmin(db, authCfg, data) {
  const fields = authCfg.admin_roles.filter(fn => data.hasOwnProperty(fn))
  if (!data.email || fields.length == 0) {
    return Promise.reject(new InputError('Missing email or valid fields'))
  }
  const fCols = fields.join(', ')
  const fValues = fields.map(fn => `$(${fn})`).join(', ')
  const fSet = fields.map(fn => `${fn} = EXCLUDED.${fn}`).join(', ')
  fields.forEach(fn => {
    if (data.hasOwnProperty(fn) && typeof data[fn] !== 'boolean') {
      data[fn] = isTrueish(data[fn])
    }
  })
  return db.none(
    `INSERT INTO admin.Admins (email, ${fCols})
    VALUES ($(email), ${fValues})
    ON CONFLICT (email) DO UPDATE SET ${fSet}`,
    data
  )
}

function setAllKeys(db, authCfg) {
  return db.tx(async tx => {
    const data = await tx.any(
      `SELECT DISTINCT p.email, a.email IS NOT NULL AS is_admin
      FROM people p
        LEFT JOIN keys k USING (email)
        LEFT JOIN admin.admins a USING (email)
      WHERE k.email IS NULL`
    )
    const kt = authCfg.key_timeout
    await tx.sequence(i => {
      if (!data[i]) return undefined
      const { email, is_admin } = data[i]
      const key = randomstring.generate(12)
      const maxAge = (is_admin ? kt.admin : kt.normal) / 1000
      return tx.any(
        `INSERT INTO Keys (email, key, expires)
        VALUES ($(email), $(key), now() + $(maxAge) * interval '1 second')`,
        { email, key, maxAge }
      )
    })
    return data.length
  })
}
