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

router.get('/:id/artist', db.getArtist);
router.post('/:id/artist', db.upsertArtist);

router.get('/:id/works', db.getWorks);
router.put('/:id/works', db.createWork);
router.post('/:id/works/:work', db.updateWork);
router.delete('/:id/works/:work', db.removeWork);

router.get('/export/artists', db.exportArtists);
router.get('/export/preview', db.exportPreview)
router.get('/export/works.csv', db.exportWorks)

module.exports = router;
