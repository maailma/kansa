var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes');

var app = express();

app.use(bodyParser.json({limit: '2mb'}));
app.use(bodyParser.urlencoded({limit: '2mb',extended: true, parameterLimit:2000}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
const isDevEnv = (app.get('env') === 'development');
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    const error = err.error || err;
    const data = { status: 'error', message: error.message };
    if (isDevEnv) data.error = err;
    const status = err.status || error.status || error.name == 'InputError' && 400 || 500;
    res.status(status).json(data);
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.code || 500)
  .json({
    status: 'error',
    message: err
  });
});

module.exports = app;
