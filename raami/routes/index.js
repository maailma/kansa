var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var db = require('../queries');

router.get('/artists', db.getArtists);
router.get('/artist/:id', db.getArtist);
router.post('/artist', db.createArtist);
router.put('/artist/:id', db.updateArtist);
router.get('/works/:id', db.getWorks);
router.get('/work/:id', db.getWork);
router.post('/work', db.createWork);
router.put('/work/:id', db.updateWork);
router.delete('/work/:id', db.removeWork);

module.exports = router;
