const express = require('express')
const { isSignedIn, hasRole, matchesId } = require('@kansa/common/auth-user')

const badge = require('../badge')
const Ballot = require('../ballot')

const {
  getPeopleSpaced,
  getPeopleQuery,
  getAllPrevNames,
  getMemberEmails,
  getMemberPaperPubs
} = require('./admin-info')
const people = require('./index')
const lookupPerson = require('./lookup')
const Person = require('./person')
const PeopleStream = require('./stream')
const upgradePerson = require('./upgrade')

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

  router.post('/', hasRole('member_admin'), (req, res, next) => {
    let person
    try {
      person = new Person(req.body)
    } catch (err) {
      return next(err)
    }
    people
      .addPerson(req, db, person)
      .then(({ id, member_number }) =>
        res.json({ status: 'success', id, member_number })
      )
      .catch(next)
  })

  router.post('/lookup', isSignedIn, (req, res, next) => {
    lookupPerson(db, req.body)
      .then(data => res.json(data))
      .catch(next)
  })

  router.use('/:id*', (req, res, next) => {
    const roles = ['member_admin']
    if (req.method === 'GET') roles.push('member_list')
    matchesId(db, req, roles)
      .then(() => next())
      .catch(next)
  })

  router.get('/:id', people.getPerson)
  router.post('/:id', people.updatePerson)
  router.get('/:id/badge', badge.getBadge)

  const ballot = new Ballot(db)
  router.get('/:id/ballot', ballot.getBallot)

  router.get('/:id/barcode.:fmt', badge.getBarcode)
  router.get('/:id/log', people.getPersonLog)
  router.get('/:id/prev-names', people.getPrevNames)
  router.post('/:id/print', hasRole('member_admin'), badge.logPrint)
  router.post('/:id/upgrade', hasRole('member_admin'), (req, res, next) => {
    const data = Object.assign({}, req.body)
    data.id = parseInt(req.params.id)
    upgradePerson(req, db, data)
      .then(({ member_number, updated }) =>
        res.json({ status: 'success', member_number, updated })
      )
      .catch(next)
  })

  return router
}
