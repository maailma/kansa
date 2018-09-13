const express = require('express')
const { isSignedIn, hasRole } = require('@kansa/common/auth-user')

const adminRouter = require('./admin/router')
const getConfig = require('./get-config')
const peopleRouter = require('./people/router')
const Purchase = require('./purchase')
const userRouter = require('./user/router')

module.exports = (db, ctx) => {
  const router = express.Router()

  router.get('/config', (req, res, next) =>
    getConfig(db)
      .then(data => res.json(data))
      .catch(next)
  )

  router.use(userRouter(db, ctx))

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

  return router
}
