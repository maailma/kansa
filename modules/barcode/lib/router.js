const express = require('express')
const { isSignedIn, matchesId } = require('@kansa/common/auth-user')
const config = require('@kansa/common/config')
const { AuthError, InputError } = require('@kansa/common/errors')
const { getBarcodeData, fetchBarcode } = require('./barcode')

// Used to form the subtitle for daypass holders
const dayNames = ['Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const getBarcode = db => (req, res, next) => {
  const id = parseInt(req.params.id)
  if (isNaN(id) || id < 0) return next(new InputError('Bad id number'))
  const key = req.params.key
  const format = req.params.fmt
  if (format !== 'pdf' && format !== 'png')
    return next(new InputError('Format must be either pdf or png'))
  db.task(async ts => {
    if (!key) await matchesId(ts, req, 'member_admin')
    return getBarcodeData(ts, id, key)
  })
    .then(async data => {
      if (!data) throw new AuthError()
      const { body, headers } = await fetchBarcode(dayNames, format, data)
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${config.id}-barcode-${id}.${format}"`
      )
      res.setHeader('Content-Type', headers.get('content-type'))
      res.setHeader('Content-Length', headers.get('content-length'))
      body.pipe(res)
    })
    .catch(next)
}

module.exports = db => {
  const gb = getBarcode(db)
  const router = express.Router()
  router.get('/:key/:id.:fmt', gb)
  router.get('/:id.:fmt', isSignedIn, gb)
  return router
}
