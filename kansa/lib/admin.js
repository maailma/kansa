const Admin = require('./types/admin')
const LogEntry = require('./types/logentry')
const util = require('./util')

module.exports = { isAdminAdmin, getAdmins, setAdmin }

function isAdminAdmin(req, res, next) {
  if (req.session.user.admin_admin) next()
  else res.status(401).json({ status: 'unauthorized' })
}

function getAdmins(req, res, next) {
  req.app.locals.db
    .any('SELECT * FROM admin.Admins')
    .then(data => {
      res.status(200).json(data)
    })
    .catch(err => next(err))
}

function setAdmin(req, res, next) {
  const data = Object.assign({}, req.body)
  const fields = Admin.roleFields.filter(fn => data.hasOwnProperty(fn))
  if (!data.email || fields.length == 0) {
    res.status(400).json({ status: 'error', data })
  } else {
    const log = new LogEntry(req, 'Set admin rights for ' + data.email)
    const fCols = fields.join(', ')
    const fValues = fields.map(fn => `$(${fn})`).join(', ')
    const fSet = fields.map(fn => `${fn} = EXCLUDED.${fn}`).join(', ')
    fields.forEach(fn => util.forceBool(data, fn))
    req.app.locals.db
      .tx(tx =>
        tx.batch([
          tx.none(
            `INSERT INTO admin.Admins (email, ${fCols}) VALUES ($(email), ${fValues}) ON CONFLICT (email) DO UPDATE SET ${fSet}`,
            data
          ),
          tx.none(`INSERT INTO Log ${log.sqlValues}`, log)
        ])
      )
      .then(() => {
        res.status(200).json({ status: 'success', set: data })
      })
      .catch(err => next(err))
  }
}
