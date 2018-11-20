const express = require('express')
const { postgraphile } = require('postgraphile')
const PgSimplifyInflectorPlugin = require('@graphile-contrib/pg-simplify-inflector')
const { AuthError } = require('@kansa/common/errors')
const eventsLogin = require('./login')

const pgSettings = req => {
  const { user } = req.session
  if (!user || !user.email) throw new AuthError()
  const role = user.events_admin
    ? 'events'
    : user.events_editor
    ? 'events_editor'
    : 'events_participant'
  return { role, 'user.email': user.email }
}

const options = {
  appendPlugins: [PgSimplifyInflectorPlugin],
  classicIds: true, // only event_log has an 'id' column
  disableQueryLog: true,
  dynamicJson: true, // recommended
  //enableQueryBatching: true, // experimental
  ignoreIndexes: false, // recommended; false enables
  ignoreRbac: false, // recommended; false enables
  pgSettings,
  //readCache, // file path, recommended for production
  //simpleCollections: 'both', // default to Relay pagination only
  setofFunctionsContainNulls: true // recommended; true == no nulls
}

if (process.env.NODE_ENV === 'development') {
  Object.assign(options, {
    absoluteRoutes: true,
    disableQueryLog: false,
    enableCors: true,
    enhanceGraphiql: true,
    exportGqlSchemaPath: '/events-schema.graphql',
    extendedErrors: ['hint', 'detail', 'errcode'],
    graphiql: true,
    graphiqlRoute: '/events/graphiql',
    graphqlRoute: '/events/graphql',
    showErrorStack: true
  })
}

module.exports = (db, ctx) => {
  const router = express.Router()
  router.use(postgraphile(db.$pool, ['events'], options))
  ctx.hooks.login.push(eventsLogin)
  return router
}
