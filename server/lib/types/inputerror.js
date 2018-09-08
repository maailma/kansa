function InputError(message) {
  this.name = 'InputError'
  this.message = message || 'Input error'
  this.stack = new Error().stack
}
InputError.prototype = Object.create(Error.prototype)
InputError.prototype.constructor = InputError

module.exports = InputError
