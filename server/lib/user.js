const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const config = require('@kansa/common/config')
const { AuthError, InputError } = require('@kansa/common/errors')
const LogEntry = require('@kansa/common/log-entry')
const isTrueish = require('@kansa/common/trueish')
const { resetExpiredKey } = require('./key')
const Person = require('./people/person')

module.exports = { login, logout, getInfo }

const adminSqlRoles = config.auth.admin_roles.join(', ')

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
        ${adminSqlRoles}
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
      await new LogEntry(req, 'Login').write(ts)
    })
    .catch(error => {
      res.clearCookie('files', cookieOptions.files)
      res.clearCookie(config.id, cookieOptions.session)
      next(error)
    })
}

function logout(req, res, next) {
  const data = Object.assign({}, req.query, req.body)
  const opt = isTrueish(data.reset)
    ? 'reset'
    : isTrueish(data.all)
      ? 'all'
      : null
  // null: log out this session only, 'all': log out all sessions, 'reset': also reset/forget login key
  const { user } = req.session
  if (data.email) {
    if (!user.admin_admin) return next(new AuthError())
    if (!opt) return next(new InputError('Add all=1 or reset=1 to parameters'))
    if (data.email === user.email) delete req.session.user
  } else {
    delete req.session.user
    if (!opt) return res.json({ status: 'success', email: user.email })
  }
  const email = data.email || user.email
  req.app.locals.db
    .task(async t => {
      const data = await t.any(
        `DELETE FROM "session"
        WHERE sess #>> '{user, email}' = $1
        RETURNING sid`,
        email
      )
      if (opt === 'reset')
        await t.none(`DELETE FROM Keys WHERE email = $1`, email)
      const sessions = data[0].length
      if (!sessions)
        res.status(400).json({ status: 'error', email, opt, sessions })
      else res.json({ status: 'success', email, opt, sessions })
    })
    .catch(next)
}

function getInfo(req, res, next) {
  const { user } = req.session
  const email = (user.member_admin && req.query.email) || user.email
  req.app.locals.db
    .task(async t => {
      const people = await t.any(
        `${Person.SELECT}
        WHERE email=$1
        ORDER BY coalesce(public_last_name, preferred_name(p))`,
        email
      )
      const roleData = await t.oneOrNone(
        `SELECT ${adminSqlRoles} FROM admin.Admins WHERE email=$1`,
        email
      )
      const roles = roleData
        ? Object.keys(roleData).filter(r => roleData[r])
        : []
      res.json({ email, people, roles })
    })
    .catch(next)
}
