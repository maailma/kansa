const bodyParser = require('body-parser')
require('csv-express')
const express = require('express')
const { isSignedIn, hasRole } = require('@kansa/common/auth-user')
const Queries = require('./queries')

module.exports = origDb => {
  const url = process.env.RAAMI_PG_URL
  if (!url)
    throw new Error('The raami module requires the RAAMI_PG_URL env var')
  const { pgp } = origDb.$config
  const db = pgp(url)

  const router = express.Router()
  router.use(bodyParser.json({ limit: '2mb' }))
  router.use(
    bodyParser.urlencoded({
      limit: '2mb',
      extended: true,
      parameterLimit: 2000
    })
  )
  router.use(isSignedIn)

  const queries = new Queries(db)
  router.get('/:id/artist', queries.getArtist)
  router.post('/:id/artist', queries.upsertArtist)

  router.get('/:id/works', queries.getWorks)
  router.put('/:id/works', queries.createWork)
  router.post('/:id/works/:work', queries.updateWork)
  router.delete('/:id/works/:work', queries.removeWork)

  router.use('/export', hasRole('raami_admin'))
  router.get('/export/artists', queries.exportArtists)
  router.get('/export/preview', queries.exportPreview)
  router.get('/export/works.csv', queries.exportWorks)

  return router
}
