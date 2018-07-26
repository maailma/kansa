const fetch = require('node-fetch');

function sendEmail(type, data, delay) {
  let url = `http://kyyhky:3000/email/${type}`
  if (delay) url += `?delay=${Number(delay)}` // in minutes
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
}

module.exports = sendEmail
