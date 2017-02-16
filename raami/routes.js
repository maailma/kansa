const cors = require('cors');
var express = require('express');
var router = express.Router();

/* GET home page. */
// allow cors for debug reasons
router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", process.env.CORS_ORIGIN);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Credentials",'true')
  next();
 });

function authenticate(req, res, next) {
  if (req.session && req.session.user && req.session.user.email) next();
  else res.status(401).json({ status: 'unauthorized' });
}

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var db = require('./queries');

router.use(authenticate);

//router.get('/people/:id', db.getPeople);
//router.get('/artists', db.getArtists);
//router.post('/:id/artist', db.createArtist);

router.get('/:id/artist', db.getArtist);
router.post('/:id/artist', db.createArtist);

router.get('/:id/works', db.getWorks);
//router.get('/work/:id', db.getWork);
router.post('/:id/works', db.createWork);
router.put('/:id/works/:work', db.updateWork);
router.delete('/:id/works/:work', db.removeWork);

// router.get('/people/:pid', db.getPeople);
// router.get('/artists', db.getArtists);
// router.get('/artist/:id', db.getArtist);
// router.post('/artist', db.createArtist);
// router.put('/artist/:id', db.updateArtist);
// router.get('/works/:id', db.getWorks);
// router.get('/work/:id', db.getWork);
// router.post('/work', db.createWork);
// router.put('/work/:id', db.updateWork);
// router.delete('/work/:id', db.removeWork);

module.exports = router;
