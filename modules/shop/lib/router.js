const express = require('express')
const { isSignedIn, hasRole } = require('@kansa/common/auth-user')

const Purchase = require('./purchase')

module.exports = (db, ctx) => {
  const router = express.Router()

  const purchase = new Purchase(db, ctx)
  router.get('/data', purchase.getPurchaseData)
  router.get('/daypass-prices', purchase.getDaypassPrices)
  router.post('/daypass', purchase.makeDaypassPurchase)
  router.post('/invoice', hasRole('member_admin'), purchase.createInvoice)
  router.get('/keys', purchase.getStripeKeys)
  router.get('/list', isSignedIn, purchase.getPurchases)
  router.post('/membership', purchase.makeMembershipPurchase)
  router.post('/other', purchase.makeOtherPurchase)
  router.post('/webhook/stripe', purchase.handleStripeWebhook)

  return router
}
