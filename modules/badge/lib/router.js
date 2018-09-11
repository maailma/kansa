const express = require('express')
const { isSignedIn, hasRole } = require('@kansa/common/auth-user')
const Badge = require('./badge')

module.exports = (db, ctx) => {
  const badge = new Badge(db, ctx.config)
  const router = express.Router()
  router.get('/blank', badge.getBlank)
  router.get('/:id', isSignedIn, badge.getBadge)
  router.post('/:id/print', hasRole('member_admin'), badge.logPrint)
  return router
}
