const Queue = require('bull')
const debug = require('debug')('kyyhky:server')
const ContactSync = require('./contact-sync')
const sendEmail = require('./send-email')

const redis = {
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379
}

const messages = new Queue('messages', { redis })
messages.process('*', (job, done) => {
  sendEmail(job.name, job.data)
    .then(rx => {
      debug(`Sent ${job.name} to ${rx}`)
      done()
    })
    .catch(done)
})
messages.on('failed', (job, err) => {
  console.warn(`Job ${job.id} failed to send ${job.name} to ${job.data.email}:\n`, err);
})

const contactSync = new ContactSync()
const rxUpdates = new Queue('update-recipients', { redis })
rxUpdates.process((job, done) => {
  contactSync.sync(job.data, done)
})
rxUpdates.on('failed', (job, err) => {
  console.warn(`Job ${job.id} failed to update recipients:\n`, err);
})

module.exports = { messages, rxUpdates }
