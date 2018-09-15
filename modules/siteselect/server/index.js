const express = require('express')
const { isSignedIn, hasRole } = require('@kansa/common/auth-user')
const Admin = require('./admin')
const Ballot = require('./ballot')

module.exports = db => {
  const router = express.Router()

  const ballot = new Ballot(db)
  router.get('/:id/ballot', isSignedIn, ballot.getBallot)

  const admin = new Admin(db)
  router.use('/tokens*', hasRole('siteselection'))
  router.get('/tokens.:fmt', admin.getTokens)
  router.get('/tokens/:token', admin.findToken)

  router.use('/voters*', hasRole('siteselection'))
  router.get('/voters.:fmt', admin.getVoters)
  router.get('/voters/:id', admin.findVoterTokens)
  router.post('/voters/:id', admin.vote)

  return router
}
