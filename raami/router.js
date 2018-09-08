const bodyParser = require('body-parser')
const express = require('express')
const { AuthError } = require('./errors')
const queries = require('./queries')

const router = express.Router()
router.use(bodyParser.json({ limit: '2mb' }))
router.use(
  bodyParser.urlencoded({ limit: '2mb', extended: true, parameterLimit: 2000 })
)
router.use((req, res, next) => {
  const { user } = req.session
  if (user && user.email) next()
  else next(new AuthError())
})

router.get('/:id/artist', queries.getArtist)
router.post('/:id/artist', queries.upsertArtist)

router.get('/:id/works', queries.getWorks)
router.put('/:id/works', queries.createWork)
router.post('/:id/works/:work', queries.updateWork)
router.delete('/:id/works/:work', queries.removeWork)

router.get('/export/artists', queries.exportArtists)
router.get('/export/preview', queries.exportPreview)
router.get('/export/works.csv', queries.exportWorks)

module.exports = router
