const session = require('express-session')
const pgSession = require('connect-pg-simple')(session)
const config = require('../config')

module.exports = (pgPromise, secret) =>
  session({
    cookie: { maxAge: config.auth.session_timeout },
    name: config.id,
    resave: false,
    saveUninitialized: false,
    secret,
    store: new pgSession({
      pgPromise,
      pruneSessionInterval: 24 * 60 * 60 // 1 day
    })
  })
