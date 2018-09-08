const randomstring = require('randomstring')

function generateToken() {
  return randomstring.generate({
    length: 6,
    charset: 'ABCDEFHJKLMNPQRTUVWXY0123456789'
  })
}

function parseToken(token) {
  return (
    token &&
    token
      .trim()
      .toUpperCase()
      .replace(/G/g, '6')
      .replace(/I/g, '1')
      .replace(/O/g, '0')
      .replace(/S/g, '5')
      .replace(/Z/g, '2')
  )
}

module.exports = { generateToken, parseToken }
