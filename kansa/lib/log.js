module.exports = { getPersonLog, getUserLog }

function getPersonLog(req, res, next) {
  const id = parseInt(req.params.id)
  req.app.locals.db
    .any('SELECT * FROM Log WHERE subject = $1', id)
    .then(data => {
      res.status(200).json(data)
    })
    .catch(err => next(err))
}

function getUserLog(req, res, next) {
  const user = req.session.user
  const email = (user.member_admin && req.query.email) || user.email
  req.app.locals.db
    .any('SELECT * FROM Log WHERE author = $1', email)
    .then(log => {
      res.status(200).json({ email, log })
    })
    .catch(err => next(err))
}
