const debug = require('debug')
const { NotFoundError } = require('@kansa/common/errors')

module.exports = app => {
  const isDevEnv = app.get('env') === 'development'
  app.use((req, res, next) => next(new NotFoundError()))
  app.use((err, req, res, next) => {
    const error = err.error || err
    debug('kansa:errors')(error instanceof Error ? error.message : err)
    const data = { status: 'error', message: error.message }
    if (isDevEnv) data.error = err
    const status =
      err.status || error.status || (error.name === 'InputError' && 400) || 500
    res.status(status).json(data)
  })
}
