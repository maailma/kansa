const express = require('express')
const { isSignedIn, hasRole } = require('@kansa/common/auth-user')

const buyDaypass = require('./buy-daypass')
const buyMembership = require('./buy-membership')
const buyOther = require('./buy-other')
const createInvoice = require('./create-invoice')
const {
  getDaypassPrices,
  getPurchaseData,
  getPurchases,
  getStripeKeys
} = require('./get')
const handleStripeWebhook = require('./stripe-webhook')

module.exports = (db, ctx, cfg) => {
  if (!cfg.apikey_vars)
    throw new Error('Shop needs to know where to find your Stripe secrets')
  if (!cfg.apikey_vars.default)
    throw new Error('The "default" Stripe API key is required')
  const router = express.Router()

  router.get('/data', (req, res, next) =>
    getPurchaseData(db)
      .then(data => res.json(data))
      .catch(next)
  )

  router.get('/daypass-prices', (req, res, next) =>
    getDaypassPrices(db)
      .then(data => res.json(data))
      .catch(next)
  )

  router.get('/keys', (req, res, next) =>
    getStripeKeys(db, cfg.apikey_vars.default)
      .then(data => res.json(data))
      .catch(next)
  )

  router.get('/list', isSignedIn, (req, res, next) => {
    const { user } = req.session
    let { email } = user
    if (user.member_admin) {
      email = req.query.all ? null : req.query.email || user.email
    }
    getPurchases(db, email)
      .then(data => res.json(data))
      .catch(next)
  })

  router.post('/daypass', (req, res, next) =>
    buyDaypass(db, ctx, cfg, req)
      .then(data => res.json(data))
      .catch(next)
  )

  router.post('/invoice', hasRole('member_admin'), (req, res, next) =>
    createInvoice(db, ctx, req.body)
      .then(email => res.json({ status: 'success', email }))
      .catch(next)
  )

  router.post('/membership', (req, res, next) =>
    buyMembership(db, ctx, cfg, req)
      .then(data => res.json(data))
      .catch(next)
  )

  router.post('/other', (req, res, next) =>
    buyOther(db, ctx, cfg, req)
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
