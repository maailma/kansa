function AuthError(message = 'Unauthorized') {
  this.name = 'AuthError'
  this.message = message
  this.status = 401
}
AuthError.prototype = new Error()

function InputError(message = 'Input error') {
  this.name = 'InputError'
  this.message = message
  this.status = 400
  this.stack = new Error().stack
}
InputError.prototype = new Error()

function NotFoundError(message = 'Not Found') {
  this.name = 'NotFoundError'
  this.message = message
  this.status = 404
  this.stack = new Error().stack
}
NotFoundError.prototype = new Error()

module.exports = { AuthError, InputError, NotFoundError }
