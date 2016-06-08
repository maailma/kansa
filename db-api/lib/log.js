module.exports = { getLog };

function getLog(req, res, next) {
  req.app.locals.db.any('SELECT * FROM Transactions')
    .then(data => {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved ALL transactions'
        });
    })
    .catch(err => next(err));
}
