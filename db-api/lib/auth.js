const randomstring = require('randomstring');
const Admin = require('./types/admin');
const LogEntry = require('./types/logentry');

module.exports = { authenticate, login, logout, setKey };

function authenticate(req, res, next) {
  if (req.session && req.session.user && req.session.user.email) next();
  else {
    res.status(401).json({
      status: 'error',
      message: 'Authentication required'
    });
  }
}

function login(req, res, next) {
  const db = req.app.locals.db;
  const email = req.body && req.body.email || req.query.email || null;
  const key = req.body && req.body.key || req.query.key || null;
  if (!email || !key) return res.status(400).json({
    status: 'error',
    message: 'Email and key are required for login'
  });
  db.tx(tx => tx.batch([
    tx.one('SELECT COUNT(*) FROM Keys WHERE email=$(email) AND key=$(key)', { email, key }),
    tx.oneOrNone(`SELECT ${Admin.sqlRoles} FROM Admins WHERE email=$1`, email)
  ]))
    .then(data => {
      if (data[0].count > 0) {
        req.session.user = {
          email,
          member_admin: !!(data[1] && data[1].member_admin),
          admin_admin: !!(data[1] && data[1].admin_admin)
        };
        res.status(200).json({ status: 'success', email });
        const log = new LogEntry(req, email, 'Login');
        db.none(`INSERT INTO Transactions ${LogEntry.sqlValues}`, log);
      } else {
        res.status(401).json({
          status: 'error',
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
  const log = new LogEntry(req, data.email, 'Set access key');
  req.app.locals.db.tx(tx => tx.batch([
    tx.none(`INSERT INTO Keys (email, key) VALUES ($(email), $(key))
        ON CONFLICT (email) DO UPDATE SET key = EXCLUDED.key`, data),
    tx.none(`INSERT INTO Transactions ${LogEntry.sqlValues}`, log)
  ]))
    .then(() => { res.status(200).json({
      status: 'success',
      message: 'Key set for ' + JSON.stringify(data.email)
    })})
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
