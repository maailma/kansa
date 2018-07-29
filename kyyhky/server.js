const debug = require('debug')
const express = require('express')
const fs = require('fs')
const http = require('http')

const { messages, rxUpdates } = require('./lib/queues')

const templates = fs.readdirSync('/message-templates')
  .reduce((ls, fn) => {
    const m = fn.match(/(.*)\.mustache/)
    if (m) ls.push(m[1])
    return ls
  }, [])
if (templates.length === 0) throw new Error('Missing message templates!')
console.log(`Found ${templates.length} message templates`, templates)

// Normalize the port into a number, string, or false.
const port = (val => {
  const port = parseInt(val, 10)
  return isNaN(port) ? val  // named pipe
    : port >= 0 ? port  // port number
    : false
})(process.env.PORT || 80)

const app = express()
if (debug.enabled('kyyhky:http')) {
  const logger = require('morgan')
  app.use(logger('dev'))
}
app.set('port', port);
app.use(express.json({ limit: '50 mb' }))

app.post('/email/:type', (req, res, next) => {
  const { type } = req.params
  const delay = Number(req.query.delay) // in minutes
  const data = req.body
  if (!templates.includes(type)) {
    return next(new Error(`Unknown email type ${JSON.stringify(type)}`))
  }
  if (!data || typeof data !== 'object' || !data.email) {
    return next(new Error('Sending emails require at least an email address'))
  }
  if (delay > 0) {
    const jobId = `${type}:${data.email}`
    return messages.getJob(jobId)
      .then(prev => prev && prev.remove())
      .then(() => messages.add(type, data, { delay: delay * 60000, jobId }))
      .then(job => res.json(job.id))
      .catch(next)
  } else {
    messages.add(type, data)
      .then(job => res.json(job.id))
      .catch(next)
  }
})

app.post('/update-recipients', (req, res, next) => {
  if (!Array.isArray(req.body)) {
    return next(new Error(`Expected array as POST body, but found ${typeof req.body}`))
  }
  rxUpdates.add(req.body)
    .then(job => res.json(job.id))
    .catch(next)
})

app.use((req, res) => {
  debug('kyyhky:errors')(`404 Not Found: ${req.originalUrl}`)
  res.status(404).json({ status: 'error', message: 'Not Found' })
});

app.use((err, req, res, next) => {
  debug('kyyhky:errors')(err)
  res.status(500).json({ status: 'error', message: err.message })
});

const server = http.createServer(app);
server.listen(port);

server.on('error', error => {
  if (error.syscall !== 'listen') throw error
  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
      break
    default:
      throw error
  }
})

server.on('listening', () => {
  const addr = server.address()
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port
  debug('kyyhky:server')('Listening on ' + bind)
})
