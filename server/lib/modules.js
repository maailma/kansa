const debug = require('debug')('kansa:server')
const path = require('path')

const config = require('@kansa/common/config')
const appRouter = require('./router')

module.exports = (db, app) => {
  const ctx = {}
  app.use('/', appRouter(db, ctx))
  Object.keys(config.modules).forEach(name => {
    const mc = config.modules[name]
    if (!mc) return
    debug(`Adding module ${name}`)
    const mp = path.resolve(__dirname, '..', 'modules', name)
    const module = require(mp)
    app.use(`/${name}`, module(db, ctx, mc))
  })
  return ctx
}
