const kue = require('kue');
const queue = kue.createQueue({
  disableSearch: false,
  redis: {
    host: process.env.REDIS_HOST || 'redis',
    port: process.env.REDIS_PORT || 6379
  }
});

const reds = require('reds');  // using kue's dependency to guarantee version match
reds.createClient = require('kue/lib/redis').createClient;
const search = reds.createSearch(queue.client.getKey('search'));

const Mailer = require('./lib/mailer');
const mailer = new Mailer('templates', '.mustache', process.env.SENDGRID_APIKEY);

queue.on('job complete', (id, result) => {
  kue.Job.get(id, (err, job) => {
    if (!err) job.remove((err) => {
      if (err) throw err;
      if (result && result.to) {
        console.log('Job #%d: Sent %s to %s', job.id, job.type, result.to);
      } else if (job.data.email) {
        console.log('Job #%d: Skipped %s for %s', job.id, job.type, job.data.email);
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

queue.process('hugo-update-email', (job, done) => {
  mailer.sendEmail(job.type, job.data, done);
});

queue.process('hugo-update-nominations', (job, done) => {
  const email = job.data.email;
  search.query(email).end((err, ids) => {
    if (err) return done(err);
    const later = ids.filter(id => id > job.id);  // TODO: verify that this is valid
    if (later.length > 0) {
      done();
    } else {
      mailer.sendEmail(job.type, job.data, done);
    }
  });
});

kue.app.listen(3000);
