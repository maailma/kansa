module.exports = function getLog(db, req) {
  const { user } = req.session
  const email = (user.member_admin && req.query.email) || user.email
  return db
    .any('SELECT * FROM Log WHERE author = $1', email)
    .then(log => ({ email, log }))
}
