const fs = require('fs');
const mustache = require('mustache');
const randomstring = require('randomstring');
const sendgrid  = require('sendgrid')(process.env.SENDGRID_APIKEY);
const tfm = require('tiny-frontmatter');
const wrap = require('wordwrap')(72);

const Admin = require('./types/admin');
const LogEntry = require('./types/logentry');
const util = require('./util');

module.exports = { authenticate, verifyPeopleAccess, login, logout, setKey, userInfo, getAdmins, setAdmin };

function authenticate(req, res, next) {
  if (req.session && req.session.user && req.session.user.email) next();
  else res.status(401).json({ status: 'unauthorized' });
}

function verifyPeopleAccess(req, res, next) {
  const id = parseInt(req.params.id);
  const user = req.session.user;
  if (isNaN(id) || id < 0) res.status(400).json({ status: 'error', message: 'Bad id number' });
  else if (user.member_admin) next();
  else req.app.locals.db.oneOrNone('SELECT email FROM People WHERE id = $1', id)
    .then(data => {
      if (data && user.email === data.email) next();
      else res.status(401).json({ status: 'unauthorized' });
    })
    .catch(err => next(err));
}

function login(req, res, next) {
  const db = req.app.locals.db;
  const email = req.body && req.body.email || req.query.email || null;
  const key = req.body && req.body.key || req.query.key || null;
  if (!email || !key) return res.status(400).json({
    status: 'error',
    message: 'Email and key are required for login'
  });
  db.task(t => t.batch([
    t.one('SELECT COUNT(*) FROM Keys WHERE email=$(email) AND key=$(key)', { email, key }),
    t.oneOrNone(`SELECT ${Admin.sqlRoles} FROM Admins WHERE email=$1`, email)
  ]))
    .then(data => {
      if (data[0].count > 0) {
        req.session.user = {
          email,
          member_admin: !!(data[1] && data[1].member_admin),
          admin_admin: !!(data[1] && data[1].admin_admin)
        };
        res.status(200).json({ status: 'success', email });
        const log = new LogEntry(req, 'Login');
        db.none(`INSERT INTO Log ${LogEntry.sqlValues}`, log);
      } else {
        res.status(401).json({
          status: 'unauthorized',
          message: 'Email and key don\'t match'
        });
      }
    })
    .catch(err => next(err));
}

function logout(req, res) {
  delete req.session.user;
  res.status(200).json({ status: 'success' });
}

function setKeyChecked(req, res, next) {
  const data = { email: req.body.email, key: randomstring.generate(12) };
  data.uri = encodeURI(`${process.env.API_ROOT}/login?email=${data.email}&key=${data.key}`);
  const log = new LogEntry(req, 'Set access key');
  log.author = data.email;
  req.app.locals.db.tx(tx => tx.batch([
    tx.none(`INSERT INTO Keys (email, key) VALUES ($(email), $(key))
        ON CONFLICT (email) DO UPDATE SET key = EXCLUDED.key`, data),
    tx.none(`INSERT INTO Log ${LogEntry.sqlValues}`, log)
  ]))
    .then(() => fs.readFile('templates/set-key.mustache', 'utf8', (err, raw) => {
      if (err) return next(err);
      const tmpl = tfm(raw);
      const msg = tmpl.attributes;
      msg.to = data.email;
      msg.text = wrap(mustache.render(tmpl.body, data));
      sendgrid.send(msg, err => {
        if (err) return next(err);
        const email = { to: data.email, from: msg.from, fromname: msg.fromname, subject: msg.subject };
        res.status(200).json({ status: 'success', email });
      });
    }))
    .catch(err => next(err));
}

function setKey(req, res, next) {
  if (!req.body || !req.body.email) {
    res.status(400).json({
      status: 'error',
      message: 'An email address is required for setting its key!'
    });
  } else {
    req.app.locals.db.one('SELECT COUNT(*) FROM People WHERE email=$1', req.body.email)
      .then(data => {
        if (data.count > 0) setKeyChecked(req, res, next);
        else res.status(400).json({
          status: 'error',
          message: 'Email address ' + JSON.stringify(req.body.email) + ' not found'
        });
      })
      .catch(err => next(err));
  }
}

function userInfo(req, res, next) {
  const email = req.session.user.member_admin && req.query.email || req.session.user.email;
  req.app.locals.db.task(t => t.batch([
    t.any('SELECT * FROM People WHERE email=$1', email),
    t.oneOrNone(`SELECT ${Admin.sqlRoles} FROM Admins WHERE email=$1`, email)
  ]))
    .then(data => {
      res.status(200).json({
        email,
        people: data[0],
        roles: data[1] ? Object.keys(data[1]).filter(r => data[1][r]) : []
      });
    })
    .catch(err => next(err));
}

function getAdmins(req, res, next) {
  if (!req.session.user.admin_admin) {
    res.status(401).json({ status: 'unauthorized' });
  } else {
    req.app.locals.db.any('SELECT * FROM Admins')
      .then(data => { res.status(200).json(data); })
      .catch(err => next(err));
  }
}

function setAdmin(req, res, next) {
  if (!req.session.user.admin_admin) {
    res.status(401).json({ status: 'unauthorized' });
  } else {
    const data = Object.assign({}, req.body);
    const fields = [ 'admin_admin', 'member_admin' ].filter(fn => data.hasOwnProperty(fn));
    if (!data.email || fields.length == 0) {
      res.status(400).json({ status: 'error', message: 'No valid parameters', data });
    } else {
      const log = new LogEntry(req, 'Set admin rights');
      const fCols = fields.join(', ');
      const fValues = fields.map(fn => `$(${fn})`).join(', ');
      const fSet = fields.map(fn => `${fn} = EXCLUDED.${fn}`).join(', ');
      fields.forEach(fn => util.forceBool(data, fn));
      req.app.locals.db.tx(tx => tx.batch([
        tx.none(`INSERT INTO Admins (email, ${fCols}) VALUES ($(email), ${fValues}) ON CONFLICT (email) DO UPDATE SET ${fSet}`, data),
        tx.none(`INSERT INTO Log ${LogEntry.sqlValues}`, log)
      ]))
        .then(() => { res.status(200).json({ status: 'success', set: data }); })
        .catch(err => next(err));
    }
  }
}
