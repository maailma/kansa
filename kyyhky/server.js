// patch JSON body-parser used by kue
const bodyParser = require('body-parser')
const origJsonParser = bodyParser.json
Object.defineProperty(bodyParser, 'json', {
  configurable: true,
  enumerable: true,
  get: () => (opts = {}) => origJsonParser(Object.assign({ limit: '50mb' }, opts))
})

const debug = require('debug')('kyyhky:server')
const kue = require('kue')
const queue = kue.createQueue({
  disableSearch: false,
  redis: {
    host: process.env.REDIS_HOST || 'redis',
    port: process.env.REDIS_PORT || 6379
  }
});

const reds = require('reds')  // using kue's dependency to guarantee version match
reds.createClient = require('kue/lib/redis').createClient
const search = reds.createSearch(queue.client.getKey('search'))

const SendGrid = require('sendgrid')
let sendgrid
if (process.env.SENDGRID_APIKEY) {
  sendgrid = SendGrid(process.env.SENDGRID_APIKEY)
} else {
  sendgrid = {
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


const ContactSync = require('./lib/contact-sync')
const contactSync = new ContactSync(sendgrid)

queue.process('update-recipients', (job, done) => {
  contactSync.sync(job.data, done)
})


const Mailer = require('./lib/mailer')
const mailer = new Mailer('templates', '.mustache', sendgrid)

queue.on('job complete', (id, result) => {
  kue.Job.get(id, (err, job) => {
    if (!err) job.remove((err) => {
      if (err) throw err
      if (result && result.to) {
        debug('Job #%d: Sent %s to %s', job.id, job.type, result.to)
      } else if (job.data.email) {
        debug('Job #%d: Skipped %s for %s', job.id, job.type, job.data.email)
      }
    })
  })
})

queue.on('job failed', (id, result) => {
  console.warn('Job #%d failed:', id, result);
});

[
  'hugo-update-email',
  'kansa-add-paper-pubs',
  'kansa-create-account',
  'kansa-new-member',
  'kansa-new-payment',
  'kansa-set-key',
  'kansa-upgrade-person'
].forEach(type => (
  queue.process(type, (job, done) => {
    mailer.sendEmail(job.type, job.data, done);
  })
));

[
  'hugo-update-nominations',
  'hugo-update-votes'
].forEach(type => {
  queue.process(type, (job, done) => {
    const email = job.data.email
    search.query(email).end((err, ids) => {
      if (err) return done(err)
      const later = ids.filter(id => id > job.id)  // TODO: verify that this is valid
      if (later.length > 0) {
        done()
      } else {
        mailer.sendEmail(job.type, job.data, done)
      }
    });
  });
});


kue.app.listen(3000)
