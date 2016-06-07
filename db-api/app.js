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

const db = require('./queries');
const router = express.Router();
router.post('/key', db.setKey);
router.get('/log', db.getLog);
router.get('/people', db.getEveryone);
router.get('/people/:id', db.getSinglePerson);
router.post('/people', db.addPerson);
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
