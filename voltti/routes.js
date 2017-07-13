var express = require('express');
var router = express.Router();

function authenticate(req, res, next) {
  if (req.session && req.session.user && req.session.user.email) next();
  else res.status(401).json({ status: 'unauthorized' });
}

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var db = require('./queries');

router.use(authenticate);

router.get('/volunteers', db.getVolunteers);
router.get('/:id/volunteer', db.getVolunteer);
router.post('/:id/volunteer', db.upsertVolunteer);

router.get('/export/volunteers', db.exportVolunteers);

module.exports = router;
