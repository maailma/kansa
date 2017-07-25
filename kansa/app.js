const debug = require('debug')
const debugErrors = debug('kansa:errors')

const cors = require('cors');
const csv = require('csv-express');
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const session = require('express-session');

const pgSession = require('connect-pg-simple')(session);
const pgOptions = { promiseLib: require('bluebird') };
const pgp = require('pg-promise')(pgOptions);
if (debug.enabled('kansa:db')) {
  const pgMonitor = require('pg-monitor');
  pgMonitor.attach(pgOptions);
}
const db = pgp(process.env.DATABASE_URL);

const admin = require('./lib/admin');
const badge = require('./lib/badge');
const Ballot = require('./lib/ballot');
const ballot = new Ballot(db);
const key = require('./lib/key');
const log = require('./lib/log');
const { setAllMailRecipients } = require('./lib/mail');
const people = require('./lib/people');
const PeopleStream = require('./lib/PeopleStream');
const publicData = require('./lib/public');
const Purchase = require('./lib/purchase');
const purchase = new Purchase(pgp, db);
const Siteselect = require('./lib/siteselect');
const siteselect = new Siteselect(db);
const slack = require('./lib/slack');
const upgrade = require('./lib/upgrade');
const user = require('./lib/user');

const app = express();
const server = http.createServer(app);
const expressWs = require('express-ws')(app, server);
const router = express.Router();
const peopleStream = new PeopleStream(db);

// these are accessible without authentication
router.get('/public/people', cors({ origin: '*' }), publicData.getPublicPeople);
router.get('/public/stats', cors({ origin: '*' }), publicData.getPublicStats);
router.get('/public/daypass-stats', cors({ origin: '*' }), publicData.getDaypassStats);

router.post('/key', key.setKey);
router.all('/login', user.login);

router.get('/barcode/:key/:id.:fmt', badge.getBarcode);
router.get('/blank-badge', badge.getBadge);

router.get('/favicon.ico', (req, res, next) => {
  res.sendFile('static/favicon.ico', { root: __dirname }, err => err && next(err));
});

router.post('/purchase', purchase.makeMembershipPurchase);
router.get('/purchase/data', purchase.getPurchaseData);
router.get('/purchase/daypass-prices', purchase.getDaypassPrices);
router.post('/purchase/daypass', purchase.makeDaypassPurchase);
router.post('/purchase/invoice', purchase.createInvoice);
router.get('/purchase/keys', purchase.getStripeKeys);
router.get('/purchase/list', purchase.getPurchases);
router.post('/purchase/other', purchase.makeOtherPurchase);
router.get('/purchase/prices', purchase.getPrices);
router.post('/webhook/stripe', purchase.handleStripeWebhook)

// subsequent routes require authentication
router.use(user.authenticate);
router.all('/logout', user.logout);

router.get('/members/emails', people.getMemberEmails);
router.get('/members/paperpubs', people.getMemberPaperPubs);

router.get('/people', people.getPeople);
router.post('/people', people.authAddPerson);
router.post('/people/lookup', publicData.lookupPerson);

router.all('/people/:id*', user.verifyPeopleAccess);
router.get('/people/:id', people.getPerson);
router.post('/people/:id', people.updatePerson);
router.get('/people/:id/badge', badge.getBadge);
router.get('/people/:id/ballot', ballot.getBallot);
router.get('/people/:id/log', log.getPersonLog);
router.post('/people/:id/upgrade', upgrade.authUpgradePerson);

router.post('/slack/invite', slack.invite);

router.get('/user', user.getInfo);
router.get('/user/log', log.getUserLog);

router.all('/siteselect*', siteselect.verifyAccess);
router.get('/siteselect/tokens.:fmt', siteselect.getTokens);
router.get('/siteselect/tokens/:token', siteselect.findToken);
router.get('/siteselect/voters.:fmt', siteselect.getVoters);
router.get('/siteselect/voters/:id', siteselect.findVoterTokens);
router.post('/siteselect/voters/:id', siteselect.vote);

router.all('/admin*', admin.isAdminAdmin);
router.get('/admin', admin.getAdmins);
router.post('/admin', admin.setAdmin);
router.post('/admin/set-keys', key.setAllKeys);
router.post('/admin/set-recipients', setAllMailRecipients);

app.locals.db = db;
if (debug.enabled('kansa:http')) {
  const logger = require('morgan');
  app.use(logger('dev'));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const corsOrigins = process.env.CORS_ORIGIN;
if (corsOrigins) app.use(cors({
  credentials: true,
  methods: [ 'GET', 'POST' ],
  origin: corsOrigins.split(/[ ,]+/)
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
app.ws('/people/updates', (ws, req) => {
  if (req.session.user.member_admin) peopleStream.addClient(ws);
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
  debugErrors(error instanceof Error ? error.message : err)
  const data = { status: 'error', message: error.message };
  if (isDevEnv) data.error = err;
  const status = err.status || error.status || error.name == 'InputError' && 400 || 500;
  res.status(status).json(data);
});

module.exports = { app, server };
