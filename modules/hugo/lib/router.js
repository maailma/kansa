const express = require('express')
const adminRouter = require('./admin/router')
const Nominate = require('./nominate')
const Vote = require('./vote')

module.exports = origDb => {
  const url = process.env.HUGO_PG_URL
  if (!url) throw new Error('The hugo module requires the HUGO_PG_URL env var')
  const { pgp } = origDb.$config
  const db = pgp(url)

  const router = express.Router()
  router.use('/admin', adminRouter(pgp, db))

  const nominate = new Nominate(db)
  router.get('/:id/nominations', nominate.getNominations)
  router.post('/:id/nominate', nominate.nominate)

  const vote = new Vote(pgp, db)
  router.get('/finalists', vote.getFinalists)
  router.get('/:id/packet', vote.getPacket)
  router.get('/:id/packet-series-extra', vote.packetSeriesExtra)
  router.get('/:id/votes', vote.getVotes)
  router.post('/:id/vote', vote.setVotes)

  return router
}
