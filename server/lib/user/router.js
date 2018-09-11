const express = require('express')
const { isSignedIn } = require('@kansa/common/auth-user')
const config = require('@kansa/common/config')

const refreshKey = require('../key/refresh')
const sendKey = require('../key/send')
const setKey = require('../key/set')

const getInfo = require('./info')
const getLog = require('./log')
const login = require('./login')
const logout = require('./logout')

const cookieOptions = {
  files: { httpOnly: true, path: '/member-files', secure: true },
  session: {
    httpOnly: true,
    path: '/',
    maxAge: config.auth.session_timeout
  }
}

module.exports = (db, ctx) => {
  ctx.user = { getInfo, refreshKey, setKey }
  const router = express.Router()

  router.post('/key', (req, res, next) =>
    sendKey(req, db)
      .then(email => res.json({ status: 'success', email }))
      .catch(next)
  )

  router.all('/login', (req, res, next) =>
    login(db, req)
      .then(({ email, token }) => {
        res.cookie('files', token, cookieOptions.files)
        res.json({ status: 'success', email })
      })
      .catch(next)
  )
  router.use('/login', (err, req, res, next) => {
    res.clearCookie('files', cookieOptions.files)
    res.clearCookie(config.id, cookieOptions.session)
    next(err)
  })

  router.all('/logout', isSignedIn, (req, res, next) => {
    res.clearCookie('files', cookieOptions.files)
    res.clearCookie(config.id, cookieOptions.session)
    logout(db, req)
      .then(data => {
        data.status = 'success'
        res.json(data)
      })
      .catch(next)
  })

  router.get('/user', isSignedIn, (req, res, next) =>
    getInfo(db, req)
      .then(data => res.json(data))
      .catch(next)
  )

  router.get('/user/log', isSignedIn, (req, res, next) =>
    getLog(db, req)
      .then(data => res.json(data))
      .catch(next)
  )

  return router
}
