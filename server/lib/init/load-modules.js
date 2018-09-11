const debug = require('debug')('kansa:server')
const path = require('path')

const adminRouter = require('../admin/router')
const config = require('../config')
const getPublicConfig = require('../config/public')
const peopleRouter = require('../people/router')
const userRouter = require('../user/router')

module.exports = (db, app, root) => {
  const ctx = { config, pgp: db.$config.pgp }

  app.get('/config', (req, res, next) =>
    getPublicConfig(db)
      .then(data => res.json(data))
      .catch(next)
  )

  app.use(userRouter(db, ctx))
  app.use('/people', adminRouter(db, ctx))
  app.use('/people', peopleRouter(db, ctx))

  Object.keys(config.modules).forEach(name => {
    const mc = config.modules[name]
    if (!mc) return
    debug(`Adding module ${name}`)
    const mp = path.resolve(root, name)
    app.use(`/${name}`, require(mp)(db, ctx, mc))
  })

  return ctx
}
