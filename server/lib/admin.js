const config = require('@kansa/common/config')
const { InputError } = require('@kansa/common/errors')
const isTrueish = require('@kansa/common/trueish')
const LogEntry = require('./types/logentry')

module.exports = { getAdmins, setAdmin }

function forceBool(obj, prop) {
  const src = obj[prop]
  if (obj.hasOwnProperty(prop) && typeof src !== 'boolean') {
    obj[prop] = isTrueish(src)
  }
}

function getAdmins(req, res, next) {
  req.app.locals.db
    .any('SELECT * FROM admin.Admins')
    .then(data => res.json(data))
    .catch(next)
}

function setAdmin(req, res, next) {
  const data = Object.assign({}, req.body)
  const fields = config.auth.admin_roles.filter(fn => data.hasOwnProperty(fn))
  if (!data.email || fields.length == 0) {
    return next(new InputError('Missing email or valid fields'))
  }
  const log = new LogEntry(req, 'Set admin rights for ' + data.email)
  const fCols = fields.join(', ')
  const fValues = fields.map(fn => `$(${fn})`).join(', ')
  const fSet = fields.map(fn => `${fn} = EXCLUDED.${fn}`).join(', ')
  fields.forEach(fn => forceBool(data, fn))
  req.app.locals.db
    .tx(async tx => {
      await tx.none(
        `INSERT INTO admin.Admins (email, ${fCols})
        VALUES ($(email), ${fValues})
        ON CONFLICT (email) DO UPDATE SET ${fSet}`,
        data
      )
      await tx.none(`INSERT INTO Log ${log.sqlValues}`, log)
      res.json({ status: 'success', set: data })
    })
    .catch(next)
}
