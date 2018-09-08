const cors = require('cors')
const csv = require('csv-express')
const express = require('express')
const http = require('http')
const logger = require('morgan')
const bodyParser = require('body-parser')
const session = require('express-session')

const pgSession = require('connect-pg-simple')(session)
const pgOptions = { promiseLib: require('bluebird') }
const pgp = require('pg-promise')(pgOptions)
require('pg-monitor').attach(pgOptions)
const db = pgp(process.env.DATABASE_URL)

const adminRouter = require('./lib/admin/router')
const config = require('./lib/config')
const nominate = require('./lib/nominate')
const Vote = require('./lib/vote')
const vote = new Vote(pgp, db)

const app = express()
const server = http.createServer(app)
const expressWs = require('express-ws')(app, server)

app.locals.db = db
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

const router = express.Router()
router.use('/admin', adminRouter(pgp, db))

router.get('/:id/nominations', nominate.getNominations)
router.post('/:id/nominate', nominate.nominate)

router.get('/finalists', vote.getFinalists)
router.get('/:id/packet', vote.getPacket)
router.get('/:id/packet-series-extra', vote.packetSeriesExtra)
router.get('/:id/votes', vote.getVotes)
router.post('/:id/vote', vote.setVotes)

app.ws('/*', (ws, req) => ws.close(4004, 'Not Found'))
// express-ws monkeypatching breaks the server on unhandled paths
app.use('/', router)

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
