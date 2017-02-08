const Admin = require('./types/admin');
const LogEntry = require('./types/logentry');
const util = require('./util');

module.exports = { authenticate, verifyPeopleAccess, login, logout, getInfo };

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
    t.oneOrNone(`SELECT ${Admin.sqlRoles} FROM admin.Admins WHERE email=$1`, email)
  ]))
    .then(data => {
      if (data[0].count > 0) {
        req.session.user = {
          email,
          member_admin: !!(data[1] && data[1].member_admin),
          hugo_admin: !!(data[1] && data[1].hugo_admin),
          admin_admin: !!(data[1] && data[1].admin_admin),
          raami_admin: !!(data[1] && data[1].raami_admin)
        };
        res.status(200).json({ status: 'success', email });
        const log = new LogEntry(req, 'Login');
        db.none(`INSERT INTO Log ${log.sqlValues}`, log);
      } else {
        res.status(401).json({
          status: 'unauthorized',
          message: 'Email and key don\'t match'
        });
      }
    })
    .catch(err => next(err));
}

function logout(req, res, next) {
  const data = Object.assign({}, req.query, req.body);
  const opt = ['all', 'reset'].reduce((prev, o) => util.isTrueish(data[o]) ? o : prev, null);
    // null: log out this session only, 'all': log out all sessions, 'reset': also reset/forget login key
  const user = req.session.user;
  if (data.email && !user.admin_admin) return res.status(401).json({ status: 'unauthorized' });
    // only admin_admin can log out other users
  const email = data.email || user.email;
  if (email === user.email) delete req.session.user;
  else if (!opt) return res.status(400).json({ status: 'error', message: 'Add all=1 or reset=1 to parameters' });
    // if logging out someone else, make it clear what we're doing
  if (!opt) return res.status(200).json({ status: 'success', email });
  req.app.locals.db.task(t => {
    const tasks = [ t.any(`DELETE FROM "session" WHERE sess #>> '{user, email}' = $1 RETURNING sid`, email) ];
    if (opt === 'reset') tasks.push(t.none(`DELETE FROM Keys WHERE email = $1`, email));
    return t.batch(tasks);
  })
    .then(data => {
      const sessions = data[0].length;
      if (!sessions) res.status(400).json({ status: 'error', email, opt, sessions });
      else res.status(200).json({ status: 'success', email, opt, sessions });
    })
    .catch(err => next(err));
}

function getInfo(req, res, next) {
  const email = req.session.user.member_admin && req.query.email || req.session.user.email;
  req.app.locals.db.task(t => t.batch([
    t.any('SELECT * FROM People WHERE email=$1', email),
    t.oneOrNone(`SELECT ${Admin.sqlRoles} FROM admin.Admins WHERE email=$1`, email)
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
