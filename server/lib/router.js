const express = require('express')

const adminRouter = require('./admin/router')
const getConfig = require('./get-config')
const peopleRouter = require('./people/router')
const userRouter = require('./user/router')

module.exports = (db, ctx) => {
  const router = express.Router()

  router.get('/config', (req, res, next) =>
    getConfig(db)
      .then(data => res.json(data))
      .catch(next)
  )

  router.use(userRouter(db, ctx))

  const ar = adminRouter(db)
  router.use('/members', ar.membersRouter)
  router.use('/people', ar)
  router.use('/people', peopleRouter(db, ctx))

  return router
}
