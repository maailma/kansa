const { InputError } = require('@kansa/common/errors')
const Admin = require('./types/admin')
const LogEntry = require('./types/logentry')
const util = require('./util')

module.exports = { getAdmins, setAdmin }

function getAdmins(req, res, next) {
  req.app.locals.db
    .any('SELECT * FROM admin.Admins')
    .then(data => res.json(data))
    .catch(next)
}

function setAdmin(req, res, next) {
  const data = Object.assign({}, req.body)
  const fields = Admin.roleFields.filter(fn => data.hasOwnProperty(fn))
  if (!data.email || fields.length == 0) {
    return next(new InputError('Missing email or valid fields'))
  }
  const log = new LogEntry(req, 'Set admin rights for ' + data.email)
  const fCols = fields.join(', ')
  const fValues = fields.map(fn => `$(${fn})`).join(', ')
  const fSet = fields.map(fn => `${fn} = EXCLUDED.${fn}`).join(', ')
  fields.forEach(fn => util.forceBool(data, fn))
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
