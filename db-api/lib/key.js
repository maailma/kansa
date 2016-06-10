const fs = require('fs');
const mustache = require('mustache');
const randomstring = require('randomstring');
const sendgrid  = require('sendgrid')(process.env.SENDGRID_APIKEY);
const tfm = require('tiny-frontmatter');
const wrap = require('wordwrap')(72);

const LogEntry = require('./types/logentry');

module.exports = { setKey };

function setKeyChecked(req, res, next) {
  const data = { email: req.body.email, key: randomstring.generate(12) };
  data.uri = encodeURI(`${process.env.API_ROOT}/login?email=${data.email}&key=${data.key}`);
  const log = new LogEntry(req, 'Set access key');
  log.author = data.email;
  req.app.locals.db.tx(tx => tx.batch([
    tx.none(`INSERT INTO Keys (email, key) VALUES ($(email), $(key))
        ON CONFLICT (email) DO UPDATE SET key = EXCLUDED.key`, data),
    tx.none(`INSERT INTO Log ${LogEntry.sqlValues}`, log)
  ]))
    .then(() => fs.readFile('templates/set-key.mustache', 'utf8', (err, raw) => {
      if (err) return next(err);
      const tmpl = tfm(raw);
      const msg = tmpl.attributes;
      msg.to = data.email;
      msg.text = wrap(mustache.render(tmpl.body, data));
      sendgrid.send(msg, err => {
        if (err) return next(err);
        const email = { to: data.email, from: msg.from, fromname: msg.fromname, subject: msg.subject };
        res.status(200).json({ status: 'success', email });
      });
    }))
    .catch(err => next(err));
}

function setKey(req, res, next) {
  if (!req.body || !req.body.email) {
    res.status(400).json({
      status: 'error',
      message: 'An email address is required for setting its key!'
    });
  } else {
    req.app.locals.db.one('SELECT COUNT(*) FROM People WHERE email=$1', req.body.email)
      .then(data => {
        if (data.count > 0) setKeyChecked(req, res, next);
        else res.status(400).json({
          status: 'error',
          message: 'Email address ' + JSON.stringify(req.body.email) + ' not found'
        });
      })
      .catch(err => next(err));
  }
}
