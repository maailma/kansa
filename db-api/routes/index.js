const router = require('express').Router();
const db = require('../queries');

router.get('/log', db.getLog);
router.get('/people', db.getEveryone);
router.get('/people/:id', db.getSinglePerson);
router.post('/people', db.addPerson);

router.put('/api/puppies/:id', db.updatePuppy);
router.delete('/api/puppies/:id', db.removePuppy);

module.exports = router;
