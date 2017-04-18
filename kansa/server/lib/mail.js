const fetch = require('node-fetch');

module.exports = {
  mailTask
}

function mailTask(type, data, options = { searchKeys: [] }) {
  fetch('http://kyyhky:3000/job', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, data, options })
  })
}
