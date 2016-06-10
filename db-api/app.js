const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const session = require('express-session');

const pgOptions = { promiseLib: require('bluebird') };
const pgp = require('pg-promise')(pgOptions);
require('pg-monitor').attach(pgOptions);

const app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  name: 'w75',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.locals.db = pgp(process.env.DATABASE_URL);

const admin = require('./lib/admin');
const key = require('./lib/key');
const log = require('./lib/log');
const people = require('./lib/people');
const user = require('./lib/user');
const router = express.Router();

// these are accessible without authentication
router.get('/public/people', people.getPublicPeople);
router.get('/public/stats', people.getPublicStats);

router.post('/key', key.setKey);
router.all('/login', user.login);
router.all('/logout', user.logout);

// subsequent routes require authentication
router.use(user.authenticate);

router.get('/people', people.getPeople);
router.post('/people', people.addPerson);

router.all('/people/:id*', user.verifyPeopleAccess);
router.get('/people/:id', people.getPerson);
router.post('/people/:id', people.updatePerson);
router.get('/people/:id/log', log.getPersonLog);

router.get('/user', user.getInfo);
router.get('/user/log', log.getUserLog);

router.all('/admin*', admin.isAdminAdmin);
router.get('/admin', admin.getAdmins);
router.post('/admin', admin.setAdmin);

app.use('/', router);

// no match from router -> 404
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
const isDevEnv = (app.get('env') === 'development');
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500);
  res.json({
    status: 'error',
    message: isDevEnv ? err : err.message
  });
});

module.exports = app;
