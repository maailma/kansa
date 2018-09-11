const debug = require('debug')('kansa:server')
const path = require('path')

const config = require('@kansa/common/config')
const appRouter = require('./router')

module.exports = (db, app) => {
  app.use('/', appRouter(db))

  Object.keys(config.modules).forEach(name => {
    const mc = config.modules[name]
    if (!mc) return
    debug(`Adding module ${name}`)
    const mp = path.resolve(__dirname, '..', 'modules', name)
    const module = require(mp)
    app.use(`/${name}`, module(db, mc))
  })
}
