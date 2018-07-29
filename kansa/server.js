const debug = require('debug')('kansa:server')
const { app, server } = require('./app')

// Normalize the port into a number, string, or false.
const port = (val => {
  const port = parseInt(val, 10)
  return isNaN(port) ? val  // named pipe
    : port >= 0 ? port  // port number
    : false
})(process.env.PORT || 80)

app.set('port', port);
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
  debug('Listening on ' + bind)
})
