const kue = require('kue');
const queue = kue.createQueue({
  redis: {
    host: process.env.REDIS_HOST || 'redis',
    port: process.env.REDIS_PORT || 6379
  }
});

const Mailer = require('./lib/mailer');
const mailer = new Mailer('templates', '.mustache', process.env.SENDGRID_APIKEY);

queue.on('job complete', (id, result) => {
  kue.Job.get(id, (err, job) => {
    if (!err) job.remove((err) => {
      if (err) throw err;
      if (result && result.to) {
        console.log('Job #%d: Sent %s to %s', job.id, job.type, result.to);
      }
    });
  });
});

queue.on('job failed', (id, result) => {
  console.warn('Job #%d failed:', id, result);
});

queue.process('kansa-set-key', (job, done) => {
  mailer.sendEmail(job.type, job.data, done);
});

kue.app.listen(3000);
