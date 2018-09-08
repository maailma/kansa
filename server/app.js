const bodyParser = require('body-parser')
const cors = require('cors')
require('csv-express')
const debug = require('debug')
const express = require('express')
const session = require('express-session')
const pgSession = require('connect-pg-simple')(session)
const http = require('http')

const config = require('./lib/config')
const PeopleStream = require('./lib/PeopleStream')
const appRouter = require('./lib/router')

const pgOptions = {}
const pgp = require('pg-promise')(pgOptions)
if (debug.enabled('kansa:db')) {
  const pgMonitor = require('pg-monitor')
  pgMonitor.attach(pgOptions)
}
const db = pgp(process.env.DATABASE_URL)
const debugErrors = debug('kansa:errors')

const app = express()
const server = http.createServer(app)
require('express-ws')(app, server)
const peopleStream = new PeopleStream(db)

app.locals.db = db
if (debug.enabled('kansa:http')) {
  const logger = require('morgan')
  app.use(logger('dev'))
}
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
    cookie: { maxAge: config.auth.session_timeout },
    name: config.id,
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
    store: new pgSession({
      pgPromise: db,
      pruneSessionInterval: 24 * 60 * 60 // 1 day
    })
  })
)
app.ws('/people/updates', (ws, req) => {
  if (req.session.user.member_admin) peopleStream.addClient(ws)
  else ws.close(4001, 'Unauthorized')
})

// express-ws monkeypatching breaks the server on unhandled paths
app.ws('/*', (ws, req) => ws.close(4004, 'Not Found'))

app.use('/', appRouter(pgp, db))

const hugoRouter = require('./modules/hugo')
app.use('/hugo', hugoRouter(pgp))

const raamiRouter = require('./modules/raami')
app.use('/raami', raamiRouter(pgp))

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
  debugErrors(error instanceof Error ? error.message : err)
  const data = { status: 'error', message: error.message }
  if (isDevEnv) data.error = err
  const status =
    err.status || error.status || (error.name == 'InputError' && 400) || 500
  res.status(status).json(data)
})

module.exports = { app, server }
