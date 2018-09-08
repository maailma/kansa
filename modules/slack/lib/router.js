const express = require('express')
const Slack = require('./slack')

module.exports = (pgp, db, config) => {
  const router = express.Router()
  const slack = new Slack(db, config)
  router.post('/invite', slack.invite)
  return router
}
