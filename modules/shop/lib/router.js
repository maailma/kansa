const express = require('express')
const { isSignedIn, hasRole } = require('@kansa/common/auth-user')

const buyDaypass = require('./buy-daypass')
const buyMembership = require('./buy-membership')
const buyOther = require('./buy-other')
const Purchase = require('./purchase')
const handleStripeWebhook = require('./stripe-webhook')

module.exports = (db, ctx) => {
  const router = express.Router()

  const purchase = new Purchase(db, ctx)
  router.get('/data', purchase.getPurchaseData)

  router.get('/daypass-prices', purchase.getDaypassPrices)
  router.post('/daypass', (req, res, next) =>
    buyDaypass(db, ctx, req)
      .then(data => res.json(data))
      .catch(next)
  )

  router.post('/invoice', hasRole('member_admin'), purchase.createInvoice)
  router.get('/keys', purchase.getStripeKeys)
  router.get('/list', isSignedIn, purchase.getPurchases)

  router.post('/membership', (req, res, next) =>
    buyMembership(db, ctx, req)
      .then(data => res.json(data))
      .catch(next)
  )

  router.post('/other', (req, res, next) =>
    buyOther(db, ctx, req)
      .then(data => res.json(data))
      .catch(next)
  )

  router.post('/webhook/stripe', (req, res, next) =>
    handleStripeWebhook(db, req.body)
      .then(() => res.status(200).end())
      .catch(next)
  )

  return router
}
