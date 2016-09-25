const fs = require('fs');
const mustache = require('mustache');
const sendgrid  = require('sendgrid');
const tfm = require('tiny-frontmatter');
const wrap = require('wordwrap')(72);

class Mailer {
  constructor(tmplDir, tmplSuffix, sendgridApiKey) {
    this.tmplDir = tmplDir;
    this.tmplSuffix = tmplSuffix;
    this.sendgrid = sendgrid(sendgridApiKey);
  }

  tmplFileName(tmplName) {
    return [ this.tmplDir, '/', tmplName, this.tmplSuffix ].filter(s => s).join('');
  }

  sendEmail(tmplName, data, next) {
    fs.readFile(this.tmplFileName(tmplName), 'utf8', (err, raw) => {
      if (err) return next(err);
      const tmpl = tfm(raw);
      const msg = tmpl.attributes;
      msg.to = data.email;
      msg.text = wrap(mustache.render(tmpl.body, data));
      sendgrid.send(msg, (err) => {
        delete msg.text;
        next(err, msg);
      });
    });
  }
}

module.exports = Mailer;
