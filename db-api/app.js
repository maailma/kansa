const express = require('express');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  name: 'w75',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

const router = express.Router();

const auth = require('./auth');
router.post('/key', auth.setKey);
router.get('/login', auth.login);
router.post('/login', auth.login);
router.get('/logout', auth.logout);

const queries = require('./queries');
router.get('/log', queries.getLog);
router.get('/people', queries.getEveryone);
router.get('/people/:id', queries.getSinglePerson);
router.post('/people', queries.addPerson);
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
