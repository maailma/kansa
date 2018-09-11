const bodyParser = require('body-parser')
const cors = require('cors')
require('csv-express')
const debug = require('debug')
const express = require('express')
const ExpressWS = require('express-ws')

module.exports = corsOrigins => {
  const app = express()
  ExpressWS(app)
  if (debug.enabled('kansa:http')) app.use(require('morgan')('dev'))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))
  if (corsOrigins)
    app.use(
      cors({
        credentials: true,
        methods: ['GET', 'POST'],
        origin: corsOrigins.split(/[ ,]+/)
      })
    )
  return app
}
