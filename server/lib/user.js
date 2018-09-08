const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const config = require('./config')
const { AuthError, InputError } = require('./errors')
const { resetExpiredKey } = require('./key')
const Admin = require('./types/admin')
const LogEntry = require('./types/logentry')
const { selectAllPeopleData } = require('./people')
const util = require('./util')

module.exports = { authenticate, verifyPeopleAccess, login, logout, getInfo }

function authenticate(req, res, next) {
  if (req.session && req.session.user && req.session.user.email) next()
  else res.status(401).json({ status: 'unauthorized' })
}

function verifyPeopleAccess(req, res, next) {
  const id = parseInt(req.params.id)
  const user = req.session.user
  if (isNaN(id) || id < 0)
    res.status(400).json({ status: 'error', message: 'Bad id number' })
  else if (user.member_admin || (req.method === 'GET' && user.member_list))
    next()
  else
    req.app.locals.db
      .oneOrNone('SELECT email FROM People WHERE id = $1', id)
      .then(data => {
        if (data && user.email === data.email) next()
        else res.status(401).json({ status: 'unauthorized' })
      })
      .catch(err => next(err))
}

function login(req, res, next) {
  const cookieOptions = {
    files: { httpOnly: true, path: '/member-files', secure: true },
    session: { httpOnly: true, path: '/', maxAge: config.auth.session_timeout }
  }
  const email = (req.body && req.body.email) || req.query.email
  const key = (req.body && req.body.key) || req.query.key
  req.app.locals.db
    .task(async ts => {
      if (!email || !key)
        throw new InputError('Email and key are required for login')
      const user = await ts.oneOrNone(
        `
      SELECT
        k.email,
        k.expires IS NOT NULL AND k.expires < now() AS expired,
        ${Admin.sqlRoles}
      FROM kansa.Keys k
        LEFT JOIN admin.Admins a USING (email)
      WHERE email=$(email) AND key=$(key)`,
        { email, key }
      )
      if (!user) throw new AuthError(`Email and key don't match`)
      if (user.expired) {
        const path = req.body && req.body.path
        await resetExpiredKey(req, ts, { email, path })
        res.clearCookie('files', cookieOptions.files)
        res.clearCookie(config.id, cookieOptions.session)
        return res.status(403).json({ status: 'expired', email })
      }
      req.session.user = user
      const token = await promisify(jwt.sign)(
        { scope: 'wsfs' },
        process.env.JWT_SECRET,
        {
          expiresIn: 120 * 60,
          subject: email
        }
      )
      res.cookie('files', token, cookieOptions.files)
      res.json({ status: 'success', email })
      const log = new LogEntry(req, 'Login')
      ts.none(`INSERT INTO Log ${log.sqlValues}`, log)
    })
    .catch(error => {
      res.clearCookie('files', cookieOptions.files)
      res.clearCookie(config.id, cookieOptions.session)
      next(error)
    })
}

function logout(req, res, next) {
  const data = Object.assign({}, req.query, req.body)
  const opt = ['all', 'reset'].reduce(
    (prev, o) => (util.isTrueish(data[o]) ? o : prev),
    null
  )
  // null: log out this session only, 'all': log out all sessions, 'reset': also reset/forget login key
  const user = req.session.user
  if (data.email && !user.admin_admin)
    return res.status(401).json({ status: 'unauthorized' })
  // only admin_admin can log out other users
  const email = data.email || user.email
  if (email === user.email) delete req.session.user
  else if (!opt)
    return res
      .status(400)
      .json({ status: 'error', message: 'Add all=1 or reset=1 to parameters' })
  // if logging out someone else, make it clear what we're doing
  if (!opt) return res.status(200).json({ status: 'success', email })
  req.app.locals.db
    .task(t => {
      const tasks = [
        t.any(
          `DELETE FROM "session" WHERE sess #>> '{user, email}' = $1 RETURNING sid`,
          email
        )
      ]
      if (opt === 'reset')
        tasks.push(t.none(`DELETE FROM Keys WHERE email = $1`, email))
      return t.batch(tasks)
    })
    .then(data => {
      const sessions = data[0].length
      if (!sessions)
        res.status(400).json({ status: 'error', email, opt, sessions })
      else res.status(200).json({ status: 'success', email, opt, sessions })
    })
    .catch(err => next(err))
}

function getInfo(req, res, next) {
  const email =
    (req.session.user.member_admin && req.query.email) || req.session.user.email
  req.app.locals.db
    .task(t =>
      t.batch([
        t.any(
          `${selectAllPeopleData} WHERE email=$1
      ORDER BY coalesce(public_last_name, preferred_name(p))`,
          email
        ),
        t.oneOrNone(
          `SELECT ${Admin.sqlRoles} FROM admin.Admins WHERE email=$1`,
          email
        )
      ])
    )
    .then(data => {
      res.status(200).json({
        email,
        people: data[0],
        roles: data[1] ? Object.keys(data[1]).filter(r => data[1][r]) : []
      })
    })
    .catch(err => next(err))
}
