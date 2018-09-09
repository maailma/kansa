const cors = require('cors')
const express = require('express')

const admin = require('./admin')
const badge = require('./badge')
const Ballot = require('./ballot')
const key = require('./key')
const log = require('./log')
const { setAllMailRecipients } = require('./mail')
const people = require('./people')
const PeopleStream = require('./PeopleStream')
const publicData = require('./public')
const Purchase = require('./purchase')
const Siteselect = require('./siteselect')
const upgrade = require('./upgrade')
const user = require('./user')

module.exports = (pgp, db) => {
  const router = express.Router()

  // these are accessible without authentication
  router.get(
    '/public/people',
    cors({ origin: '*' }),
    publicData.getPublicPeople
  )
  router.get('/public/stats', cors({ origin: '*' }), publicData.getPublicStats)
  router.get(
    '/public/daypass-stats',
    cors({ origin: '*' }),
    publicData.getDaypassStats
  )
  router.get('/config', publicData.getConfig)

  router.post('/key', key.setKey)
  router.all('/login', user.login)

  router.get('/barcode/:key/:id.:fmt', badge.getBarcode)
  router.get('/blank-badge', badge.getBadge)

  const purchase = new Purchase(pgp, db)
  router.post('/purchase', purchase.makeMembershipPurchase)
  router.get('/purchase/data', purchase.getPurchaseData)
  router.get('/purchase/daypass-prices', purchase.getDaypassPrices)
  router.post('/purchase/daypass', purchase.makeDaypassPurchase)
  router.post('/purchase/invoice', purchase.createInvoice)
  router.get('/purchase/keys', purchase.getStripeKeys)
  router.get('/purchase/list', purchase.getPurchases)
  router.post('/purchase/other', purchase.makeOtherPurchase)
  router.post('/webhook/stripe', purchase.handleStripeWebhook)

  router.all('/logout', user.authenticate, user.logout)

  router.use('/members', user.authenticate)
  router.get('/members/emails', people.getMemberEmails)
  router.get('/members/paperpubs', people.getMemberPaperPubs)

  router.use('/people', user.authenticate)
  router.get('/people', people.getPeople)
  router.post('/people', people.authAddPerson)
  router.post('/people/lookup', publicData.lookupPerson)
  router.get('/people/prev-names.:fmt', people.getAllPrevNames)

  router.all('/people/:id*', user.verifyPeopleAccess)
  router.get('/people/:id', people.getPerson)
  router.post('/people/:id', people.updatePerson)
  router.get('/people/:id/badge', badge.getBadge)

  const ballot = new Ballot(db)
  router.get('/people/:id/ballot', ballot.getBallot)

  router.get('/people/:id/barcode.:fmt', badge.getBarcode)
  router.get('/people/:id/log', log.getPersonLog)
  router.get('/people/:id/prev-names', people.getPrevNames)
  router.post('/people/:id/print', badge.logPrint)
  router.post('/people/:id/upgrade', upgrade.authUpgradePerson)

  router.use('/user', user.authenticate)
  router.get('/user', user.getInfo)
  router.get('/user/log', log.getUserLog)

  const siteselect = new Siteselect(db)
  router.use('/siteselect', siteselect.verifyAccess)
  router.get('/siteselect/tokens.:fmt', siteselect.getTokens)
  router.get('/siteselect/tokens/:token', siteselect.findToken)
  router.get('/siteselect/voters.:fmt', siteselect.getVoters)
  router.get('/siteselect/voters/:id', siteselect.findVoterTokens)
  router.post('/siteselect/voters/:id', siteselect.vote)

  router.use('/admin', admin.isAdminAdmin)
  router.get('/admin', admin.getAdmins)
  router.post('/admin', admin.setAdmin)
  router.post('/admin/set-keys', key.setAllKeys)
  router.post('/admin/set-recipients', setAllMailRecipients)

  const peopleStream = new PeopleStream(db)
  router.ws('/people/updates', (ws, req) => {
    if (req.session.user.member_admin) peopleStream.addClient(ws)
    else ws.close(4001, 'Unauthorized')
  })

  return router
}
