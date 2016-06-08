const options = { promiseLib: require('bluebird') };
const pgp = require('pg-promise')(options);
require('pg-monitor').attach(options);
const db = pgp(process.env.DATABASE_URL);
db.PG = pgp.pg;

module.exports = db;
