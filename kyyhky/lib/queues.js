const Queue = require('bull')
const debug = require('debug')('kyyhky:server')
const ContactSync = require('./contact-sync')
const Mailer = require('./mailer')

const redis = {
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379
}

const mailer = new Mailer('/message-templates', '.mustache')
const messages = new Queue('messages', { redis })
messages.process('*', (job, done) => {
  mailer.sendEmail(job.name, job.data, done)
})
messages.on('completed', (job, result) => {
  debug(`Sent ${job.name} to ${result.to}`)
})
messages.on('failed', (job, err) => {
  console.warn(`Job ${job.id} failed to send ${job.name} to ${result.to}:\n`, err);
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
