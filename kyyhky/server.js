const kue = require('kue');
const jobs = kue.createQueue({
  redis: {
    host: process.env.REDIS_HOST || 'redis',
    port: process.env.REDIS_PORT || 6379
  }
});

const Mailer = require('./lib/mailer');
const mailer = new Mailer('templates', '.mustache', process.env.SENDGRID_APIKEY);

jobs.process('kansa-set-key', (job, done) => {
  mailer.sendEmail(job.type, job.data, done);
});

kue.app.listen(3000);
