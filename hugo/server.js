const debug = require('debug')('db-api:server')

const { app, server } = require('./app')
const port = normalizePort(process.env.PORT || '80')

app.set('port', port)
server.listen(port)
server.on('error', onError)
server.on('listening', onListening)

// Normalize a port into a number, string, or false.
function normalizePort(val) {
  var port = parseInt(val, 10)
  return isNaN(port)
    ? val // named pipe
    : port >= 0
      ? port // port number
      : false
}

function onError(error) {
  if (error.syscall !== 'listen') throw error

  var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port

  // handle specific listen errors with friendly messages
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
}

function onListening() {
  var addr = server.address()
  var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port
  debug('Listening on ' + bind)
}
