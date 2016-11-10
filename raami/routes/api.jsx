var express = require('express');
var router = express.Router();

var db = require('../queries');

router.get('/artists', db.getArtists);
router.get('/artist/:id', db.getArtist);
router.post('/artist', db.createArtist);
router.put('/artist/:id', db.updateArtist);
router.get('/work', db.getWorks);
router.get('/work/:id', db.getWork);
router.post('/work', db.createWork);
router.put('/work/:id', db.updateWork);
router.delete('/work/:id', db.removeWork);

module.exports = router;