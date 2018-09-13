const express = require('express')
const { hasRole } = require('@kansa/common/auth-user')
const Admin = require('./admin')
const CanonStream = require('./canon-stream')

module.exports = (pgp, db) => {
  const router = express.Router()
  router.use(hasRole('hugo_admin'))

  const admin = new Admin(pgp, db)
  router.get('/ballots', admin.getAllBallots)
  router.get('/ballots/:category', admin.getBallots)
  router.get('/canon', admin.getCanon)
  router.get('/nominations', admin.getNominations)
  router.post('/classify', admin.classify)
  router.post('/canon/:id', admin.updateCanonEntry)
  router.get('/votes/:category', admin.getVoteResults)

  const canonStream = new CanonStream(db)
  router.ws('/canon-updates', (ws, req) => {
    if (req.session.user.hugo_admin) canonStream.addClient(ws)
    else ws.close(4001, 'Unauthorized')
  })

  return router
}
