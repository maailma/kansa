const cors = require('cors');
const express = require('express');
const http = require('http');
const logger = require('morgan');
const bodyParser = require('body-parser');
const session = require('express-session');

const pgSession = require('connect-pg-simple')(session);
const pgOptions = { promiseLib: require('bluebird') };
const pgp = require('pg-promise')(pgOptions);
require('pg-monitor').attach(pgOptions);
const db = pgp(process.env.DATABASE_URL);

const nominate = require('./lib/nominate');
const Canon = require('./lib/canon');
const canon = new Canon(pgp, db);
const CanonStream = require('./lib/canon-stream');
const canonStream = new CanonStream(db);

const app = express();
const server = http.createServer(app);
const expressWs = require('express-ws')(app, server);

app.locals.db = db;
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({
  credentials: true,
  methods: [ 'GET', 'POST' ],
  origin: process.env.CORS_ORIGIN.split(/[ ,]+/)
}));
app.use(session({
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },  // 30 days
  name: 'w75',
  resave: false,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET,
  store: new pgSession({
    pg: pgp.PG,
    pruneSessionInterval: 24 * 60 * 60  // 1 day
  })
}));

const router = express.Router();
router.all('/canon/*', Canon.verifyCanonAccess);
router.get('/canon/canon', canon.getCanon);
router.get('/canon/nominations', canon.getNominations);
router.post('/canon/classify', canon.classify);
router.post('/canon/entry/:id', canon.updateCanonEntry);

router.get('/:id/nominations', nominate.getNominations);
router.post('/:id/nominate', nominate.nominate);

app.ws('/canon/updates', (ws, req) => {
  if (req.session.user.hugo_admin) canonStream.addClient(ws);
  else ws.close(4001, 'Unauthorized');
});
app.ws('/*', (ws, req) => ws.close(4004, 'Not Found'));
  // express-ws monkeypatching breaks the server on unhandled paths
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
  const error = err.error || err;
  const data = { status: 'error', message: error.message };
  if (isDevEnv) data.error = err;
  const status = err.status || error.status || error.name == 'InputError' && 400 || 500;
  res.status(status).json(data);
});

module.exports = { app, server };
