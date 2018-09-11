const cors = require('cors')
const express = require('express')
const { isSignedIn, hasRole } = require('@kansa/common/auth-user')

const badge = require('./badge')
const sendKey = require('./key/send')
const peopleRouter = require('./people/router')
const adminRouter = require('./admin/router')
const getConfig = require('./get-config')
const Purchase = require('./purchase')
const Siteselect = require('./siteselect')
const userRouter = require('./user/router')

module.exports = (db, ctx) => {
  const router = express.Router()

  router.get('/config', (req, res, next) =>
    getConfig(db)
      .then(data => res.json(data))
      .catch(next)
  )

  router.post('/key', (req, res, next) =>
    sendKey(req, db)
      .then(email => res.json({ status: 'success', email }))
      .catch(next)
  )

  router.use(userRouter(db, ctx))

  router.get('/barcode/:key/:id.:fmt', badge.getBarcode)
  router.get('/blank-badge', badge.getBadge)

  const purchase = new Purchase(db)
  router.post('/purchase', purchase.makeMembershipPurchase)
  router.get('/purchase/data', purchase.getPurchaseData)
  router.get('/purchase/daypass-prices', purchase.getDaypassPrices)
  router.post('/purchase/daypass', purchase.makeDaypassPurchase)
  router.post(
    '/purchase/invoice',
    hasRole('member_admin'),
    purchase.createInvoice
  )
  router.get('/purchase/keys', purchase.getStripeKeys)
  router.get('/purchase/list', isSignedIn, purchase.getPurchases)
  router.post('/purchase/other', purchase.makeOtherPurchase)
  router.post('/webhook/stripe', purchase.handleStripeWebhook)

  const ar = adminRouter(db)
  router.use('/members', ar.membersRouter)
  router.use('/people', ar)
  router.use('/people', peopleRouter(db, ctx))

  const siteselect = new Siteselect(db)
  router.use('/siteselect', hasRole('siteselection'))
  router.get('/siteselect/tokens.:fmt', siteselect.getTokens)
  router.get('/siteselect/tokens/:token', siteselect.findToken)
  router.get('/siteselect/voters.:fmt', siteselect.getVoters)
  router.get('/siteselect/voters/:id', siteselect.findVoterTokens)
  router.post('/siteselect/voters/:id', siteselect.vote)

  return router
}
