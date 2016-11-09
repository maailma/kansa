var express = require('express');
var router = express.Router();

var db = require('../queries');

router.get('/api/artists', db.getArtists);
router.get('/api/artist/:id', db.getArtist);
router.post('/api/artist', db.createArtist);
router.put('/api/artist/:id', db.updateArtist);
router.get('/api/work', db.getWorks);
router.get('/api/work/:id', db.getWork);
router.post('/api/work', db.createWork);
router.put('/api/work/:id', db.updateWork);
router.delete('/api/work/:id', db.removeWork);

module.exports = router;