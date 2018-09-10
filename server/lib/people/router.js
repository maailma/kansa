const express = require('express')
const { isSignedIn, hasRole } = require('@kansa/common/auth-user')

const badge = require('../badge')
const Ballot = require('../ballot')
const log = require('../log')
const publicData = require('../public')
const user = require('../user')

const {
  getPeopleSpaced,
  getPeopleQuery,
  getAllPrevNames,
  getMemberEmails,
  getMemberPaperPubs
} = require('./admin-info')
const people = require('./index')
const PeopleStream = require('./stream')
const upgrade = require('./upgrade')

module.exports = db => {
  const router = express.Router()

  router.get(
    '/',
    hasRole(['member_admin', 'member_list']),
    (req, res, next) => {
      const p =
        Object.keys(req.query).length > 0
          ? getPeopleQuery(db, req.query)
          : getPeopleSpaced(db)
      p.then(data => res.json(data)).catch(next)
    }
  )

  router.get(
    '/prev-names.:fmt',
    hasRole(['member_admin', 'member_list']),
    (req, res, next) =>
      getAllPrevNames(db)
        .then(data => {
          const csv = req.params.fmt === 'csv'
          if (csv) res.csv(data, true)
          else res.json(data)
        })
        .catch(next)
  )

  router.membersRouter = express.Router()
  router.membersRouter.use(hasRole('member_admin'))
  router.membersRouter.get('/emails', (req, res, next) =>
    getMemberEmails(db)
      .then(data => res.csv(data, true))
      .catch(next)
  )
  router.membersRouter.get('/paperpubs', (req, res, next) =>
    getMemberPaperPubs(db)
      .then(data => res.csv(data, true))
      .catch(next)
  )

  const peopleStream = new PeopleStream(db)
  router.ws('/updates', (ws, req) => {
    hasRole(['member_admin', 'member_list'])(req, null, err => {
      if (err) ws.close(4001, 'Unauthorized')
      else peopleStream.addClient(ws)
    })
  })

  router.post('/', hasRole('member_admin'), people.authAddPerson)
  router.post('/lookup', isSignedIn, publicData.lookupPerson)

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

  return router
}
