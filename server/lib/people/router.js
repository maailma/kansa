const express = require('express')
const { isSignedIn, hasRole, matchesId } = require('@kansa/common/auth-user')

const addPerson = require('./add')
const { getPerson, getPrevNames, getPersonLog } = require('./get')
const lookupPerson = require('./lookup')
const Person = require('./person')
const updatePerson = require('./update')
const upgradePerson = require('./upgrade')

module.exports = (db, ctx) => {
  ctx.people = {
    addPerson,
    getPerson,
    updatePerson,
    upgradePerson,
    Person
  }
  const router = express.Router()

  router.post('/', hasRole('member_admin'), (req, res, next) => {
    addPerson(db, req, req.body)
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

  router.get('/:id', (req, res, next) =>
    getPerson(db, req.params.id)
      .then(data => res.json(data))
      .catch(next)
  )

  router.get('/:id/log', (req, res, next) =>
    getPersonLog(db, req.params.id)
      .then(data => res.json(data))
      .catch(next)
  )

  router.get('/:id/prev-names', (req, res, next) =>
    getPrevNames(db, req.params.id)
      .then(data => res.json(data))
      .catch(next)
  )

  router.post('/:id', (req, res, next) =>
    updatePerson(db, req)
      .then(data => res.json(data))
      .catch(next)
  )

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
