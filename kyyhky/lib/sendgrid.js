const debug = require('debug')('kyyhky:server')
const SendGrid = require('sendgrid')

if (process.env.SENDGRID_APIKEY) {
  module.exports = SendGrid(process.env.SENDGRID_APIKEY)
} else {
  module.exports = {
    emptyRequest: (request) => request || {},
    API: ({ body, method, path }) => {
      debug('MOCK SendGrid request', method, path)
      switch (path) {
        case '/v3/mail/send': {
          const { content, from, personalizations, subject } = body
          debug('FROM:', JSON.stringify(from.name), `<${from.email}>`)
          debug('TO:', JSON.stringify(personalizations[0].to[0]))
          debug('SUBJECT:', subject)
          debug('--------\n', content[0] && content[0].value, '\n--------')
          return Promise.resolve(null)
        }
        case '/v3/contactdb/recipients':
          if (method === 'GET') return Promise.reject({ response: { statusCode: 404 } })
          debug(body, '\n--------')
          return Promise.resolve({ body: '{}' })
        default:
          return Promise.reject(new Error('Unmocked path!'))
      }
    }
  };
  console.warn('Using MOCK SendGrid instance -> emails will not be sent!')
}

