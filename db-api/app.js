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

const router = express.Router();

const auth = require('./lib/auth');
router.post('/key', auth.setKey);
router.get('/login', auth.login);
router.post('/login', auth.login);
router.get('/logout', auth.logout);

// subsequent paths require authentication
router.use(auth.authenticate);

const txLog = require('./lib/log');
router.get('/log', txLog.getLog);

const people = require('./lib/people');
router.get('/people', people.getEveryone);
router.get('/people/:id', people.getSinglePerson);
router.post('/people', people.addPerson);
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
  res.status(err.status || 500);
  res.json({
    status: 'error',
    message: isDevEnv ? err : err.message
  });
});

module.exports = app;
