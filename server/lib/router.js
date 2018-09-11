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
  router.get('/shop/data', purchase.getPurchaseData)
  router.get('/shop/daypass-prices', purchase.getDaypassPrices)
  router.post('/shop/daypass', purchase.makeDaypassPurchase)
  router.post('/shop/invoice', hasRole('member_admin'), purchase.createInvoice)
  router.get('/shop/keys', purchase.getStripeKeys)
  router.get('/shop/list', isSignedIn, purchase.getPurchases)
  router.post('/shop/membership', purchase.makeMembershipPurchase)
  router.post('/shop/other', purchase.makeOtherPurchase)
  router.post('/shop/webhook/stripe', purchase.handleStripeWebhook)

  const ar = adminRouter(db)
  router.use('/members', ar.membersRouter)
  router.use('/people', ar)
  router.use('/people', peopleRouter(db, ctx))

  return router
}
