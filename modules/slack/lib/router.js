const express = require('express')
const { isSignedIn } = require('@kansa/common/auth-user')
const Slack = require('./slack')

module.exports = (db, config) => {
  const router = express.Router()
  const slack = new Slack(db, config)
  router.use(isSignedIn)
  router.post('/invite', slack.invite)
  return router
}
