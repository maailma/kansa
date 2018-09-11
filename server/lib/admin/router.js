const express = require('express')
const { hasRole } = require('@kansa/common/auth-user')

const {
  getPeopleSpaced,
  getPeopleQuery,
  getAllPrevNames,
  getMemberEmails,
  getMemberPaperPubs
} = require('./info')
const PeopleStream = require('./stream')

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

  return router
}
