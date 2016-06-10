const Admin = require('./types/admin');
const LogEntry = require('./types/logentry');

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

function logout(req, res) {
  delete req.session.user;
  res.status(200).json({ status: 'success' });
}

function getInfo(req, res, next) {
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
