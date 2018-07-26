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

const ContactSync = require('./lib/contact-sync')
const contactSync = new ContactSync()

queue.process('update-recipients', (job, done) => {
  contactSync.sync(job.data, done)
})

const Mailer = require('./lib/mailer')
const mailer = new Mailer('templates', '.mustache')

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
  'hugo-packet-series-extra',
  'hugo-update-email',
  'kansa-add-paper-pubs',
  'kansa-create-account',
  'kansa-new-daypass',
  'kansa-new-member',
  'kansa-new-payment',
  'kansa-set-key',
  'kansa-update-payment',
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
