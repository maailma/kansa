module.exports = { getPersonLog, getUserLog };

function getPersonLogChecked(id, db, res, next) {
  db.any('SELECT * FROM Log WHERE subject = $1', id)
    .then(data => { res.status(200).json(data); })
    .catch(err => next(err));
}

function getPersonLog(req, res, next) {
  const db = req.app.locals.db;
  const id = parseInt(req.params.id);
  const user = req.session.user;
  if (user.member_admin) getPersonLogChecked(id, db, res, next);
  else db.oneOrNone('SELECT email FROM People WHERE id = $1', id)
    .then(data => {
      if (data && user.email === data.email) {
        getPersonLogChecked(id, db, res, next);
      } else {
        res.status(401).json({ status: 'error' });
      }
    })
    .catch(err => next(err));
}

function getUserLog(req, res, next) {
  const user = req.session.user;
  const email = user.member_admin && req.query.email || user.email;
  req.app.locals.db.any('SELECT * FROM Log WHERE author = $1', email)
    .then(log => { res.status(200).json({ email, log }); })
    .catch(err => next(err));
}
