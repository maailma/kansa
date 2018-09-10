const express = require('express')
const { isSignedIn, hasRole } = require('@kansa/common/auth-user')

const badge = require('../badge')
const Ballot = require('../ballot')
const log = require('../log')
const publicData = require('../public')
const user = require('../user')

const people = require('./index')
const PeopleStream = require('./stream')
const upgrade = require('./upgrade')

module.exports = db => {
  const router = express.Router()
  router.use(isSignedIn)
  router.get('/', hasRole(['member_admin', 'member_list']), people.getPeople)
  router.post('/', hasRole('member_admin'), people.authAddPerson)
  router.post('/lookup', isSignedIn, publicData.lookupPerson)
  router.get(
    '/prev-names.:fmt',
    hasRole(['member_admin', 'member_list']),
    people.getAllPrevNames
  )

  const peopleStream = new PeopleStream(db)
  router.ws('/updates', (ws, req) => {
    hasRole(['member_admin', 'member_list'])(req, null, err => {
      if (err) ws.close(4001, 'Unauthorized')
      else peopleStream.addClient(ws)
    })
  })

  router.use('/:id*', user.verifyPeopleAccess)
  router.get('/:id', people.getPerson)
  router.post('/:id', people.updatePerson)
  router.get('/:id/badge', badge.getBadge)

  const ballot = new Ballot(db)
  router.get('/:id/ballot', ballot.getBallot)

  router.get('/:id/barcode.:fmt', badge.getBarcode)
  router.get('/:id/log', log.getPersonLog)
  router.get('/:id/prev-names', people.getPrevNames)
  router.post('/:id/print', hasRole('member_admin'), badge.logPrint)
  router.post(
    '/:id/upgrade',
    hasRole('member_admin'),
    upgrade.authUpgradePerson
  )

  router.membersRouter = express.Router()
  router.membersRouter.use(hasRole('member_admin'))
  router.membersRouter.get('/emails', people.getMemberEmails)
  router.membersRouter.get('/paperpubs', people.getMemberPaperPubs)

  return router
}
