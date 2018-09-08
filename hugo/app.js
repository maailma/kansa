const cors = require('cors')
require('csv-express')
const express = require('express')
const http = require('http')
const logger = require('morgan')
const bodyParser = require('body-parser')
const session = require('express-session')

const pgSession = require('connect-pg-simple')(session)
const pgOptions = { promiseLib: require('bluebird') }
const pgp = require('pg-promise')(pgOptions)
require('pg-monitor').attach(pgOptions)

const config = require('./lib/config')
const appRouter = require('./lib/router')

const app = express()
const server = http.createServer(app)
require('express-ws')(app, server)

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
const corsOrigins = process.env.CORS_ORIGIN
if (corsOrigins)
  app.use(
    cors({
      credentials: true,
      methods: ['GET', 'POST'],
      origin: corsOrigins.split(/[ ,]+/)
    })
  )
app.use(
  session({
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
    name: config.id,
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
    store: new pgSession({
      pg: pgp.PG,
      pruneSessionInterval: 24 * 60 * 60 // 1 day
    })
  })
)

// express-ws monkeypatching breaks the server on unhandled paths
app.ws('/*', (ws, req) => ws.close(4004, 'Not Found'))

app.use(appRouter(pgp, process.env.DATABASE_URL))

// no match from router -> 404
app.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
const isDevEnv = app.get('env') === 'development'
app.use((err, req, res, next) => {
  const error = err.error || err
  const data = { status: 'error', message: error.message }
  if (isDevEnv) data.error = err
  const status =
    err.status || error.status || (error.name == 'InputError' && 400) || 500
  res.status(status).json(data)
})

module.exports = { app, server }
