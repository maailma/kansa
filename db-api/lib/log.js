module.exports = { getLog };

function getLog(req, res, next) {
  req.app.locals.db.any('SELECT * FROM Log')
    .then(data => { res.status(200).json(data); })
    .catch(err => next(err));
}
