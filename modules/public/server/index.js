const cors = require('cors')
const express = require('express')

const { getDaypassStats, getPublicPeople, getPublicStats } = require('./public')

module.exports = (db, ctx, cfg) => {
  const router = express.Router()
  if (cfg.cors_origin) router.use(cors({ origin: cfg.cors_origin }))

  router.get('/people', (req, res, next) => {
    const csv = !!req.query.csv
    getPublicPeople(db)
      .then(data => (csv ? res.csv(data, true) : res.json(data)))
      .catch(next)
  })

  router.get('/stats', (req, res, next) => {
    const csv = !!req.query.csv
    getPublicStats(db, csv)
      .then(data => (csv ? res.csv(data, true) : res.json(data)))
      .catch(next)
  })

  router.get('/daypass-stats', (req, res, next) => {
    const csv = !!req.query.csv
    getDaypassStats(db, csv)
      .then(data => (csv ? res.csv(data, true) : res.json(data)))
      .catch(next)
  })

  return router
}
