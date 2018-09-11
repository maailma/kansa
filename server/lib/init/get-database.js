const debug = require('debug')
const PGP = require('pg-promise')

const pgOptions = {}
const pgp = PGP(pgOptions)
if (debug.enabled('kansa:db')) {
  const pgMonitor = require('pg-monitor')
  pgMonitor.attach(pgOptions)
}

module.exports = url => pgp(url)
