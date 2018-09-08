const express = require('express')
const { AuthError } = require('@kansa/errors')
const Admin = require('./admin')
const CanonStream = require('./canon-stream')

module.exports = (pgp, db) => {
  const router = express.Router()
  router.use((req, res, next) => {
    const { user } = req.session
    if (user && user.hugo_admin) next()
    else next(new AuthError())
  })

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
