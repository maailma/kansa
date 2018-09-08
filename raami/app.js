var express = require('express')
const cors = require('cors')
var path = require('path')
var logger = require('morgan')
var cookieParser = require('cookie-parser')

const session = require('express-session')
const pgSession = require('connect-pg-simple')(session)

var promise = require('bluebird')

var options = {
  // Initialization Options
  promiseLib: promise
}

var pgp = require('pg-promise')(options)

var config = require('./config')
var appRouter = require('./router')

var app = express()
app.use(logger('dev'))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

const corsOrigins = process.env.CORS_ORIGIN
if (corsOrigins)
  app.use(
    cors({
      credentials: true,
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

app.use(appRouter(pgp, process.env.DATABASE_URL))

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handlers

// development error handler
// will print stacktrace
const isDevEnv = app.get('env') === 'development'
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    const error = err.error || err
    const data = { status: 'error', message: error.message }
    if (isDevEnv) data.error = err
    const status =
      err.status || error.status || (error.name == 'InputError' && 400) || 500
    res.status(status).json(data)
  })
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.code || 500).json({
    status: 'error',
    message: err
  })
})

module.exports = app
