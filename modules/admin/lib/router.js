const express = require('express')
const { hasRole } = require('@kansa/common/auth-user')
const LogEntry = require('@kansa/common/log-entry')
const { setAllMailRecipients } = require('@kansa/common/mail')
const { getAdmins, setAdmin, setAllKeys } = require('./admin')

module.exports = (pgp, db) => {
  const router = express.Router()
  router.use(hasRole('admin_admin'))

  router.get('/', (req, res, next) => {
    getAdmins(db)
      .then(data => res.json(data))
      .catch(next)
  })

  router.post('/', (req, res, next) => {
    const data = Object.assign({}, req.body)
    db.tx(async tx => {
      await setAdmin(tx, data)
      await new LogEntry(req, 'Set admin rights for ' + data.email).write(tx)
    })
      .then(() => res.json({ status: 'success', set: data }))
      .catch(next)
  })

  router.post('/set-keys', (req, res, next) => {
    setAllKeys(db)
      .then(count => res.json({ status: 'success', count }))
      .catch(next)
  })

  router.post('/set-recipients', (req, res, next) => {
    setAllMailRecipients(db)
      .then(count => res.json({ success: true, count }))
      .catch(next)
  })

  return router
}
