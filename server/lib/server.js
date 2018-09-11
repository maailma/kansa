const debug = require('debug')
const path = require('path')

const getApp = require('./init/get-app')
const getDatabase = require('./init/get-database')
const getSession = require('./init/get-session')
const handleErrors = require('./init/handle-errors')
const loadModules = require('./init/load-modules')

const db = getDatabase(process.env.DATABASE_URL)
const mroot = path.resolve(__dirname, '..', 'modules')

const app = getApp(process.env.CORS_ORIGIN)
app.use(getSession(db, process.env.SESSION_SECRET))
loadModules(db, app, mroot)
handleErrors(app)

app.listen(80, () => debug('kansa:server')('Kansa kuuntelee.\n'))
