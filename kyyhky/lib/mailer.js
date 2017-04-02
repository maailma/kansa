const fs = require('fs');
const mustache = require('mustache');
const SendGrid  = require('sendgrid');
const tfm = require('tiny-frontmatter');
const wrap = require('wordwrap');

function loginUri(email, key, id) {
  const root = process.env.LOGIN_URI_ROOT;
  const parts = [root, email, key];
  if (id) parts.push(id);
  return encodeURI(parts.join('/'));
}

function nominationsString(data) {
  return data.map(({ category, nominations }) => {
    const ct = category.charAt(0) + category.slice(1).replace(/[A-Z]/g, ' $&');
    const cn = nominations.map(n => {
      const ns = Object.keys(n).map(k => n[k]).join('; ');
      return '  - ' + wrap(68)(ns).replace(/\n/g, '\n    ');
    });
    return `${ct}:\n${cn.join('\n')}`;
  }).join('\n\n');
}

class Mailer {
  constructor(tmplDir, tmplSuffix, sendgridApiKey) {
    this.tmplDir = tmplDir;
    this.tmplSuffix = tmplSuffix;
    if (sendgridApiKey) {
      this.sendgrid = SendGrid(sendgridApiKey);
    } else {
      this.sendgrid = {
        emptyRequest: (request) => request,
        API: ({ body: { content, from, personalizations: [recipient], subject }, method, path }, callback) => {
          console.log('MOCK SendGrid request', method, path);
          console.log('FROM:', JSON.stringify(from.name), `<${from.email}>`);
          console.log('TO:', JSON.stringify(recipient.name), `<${recipient.email}>`);
          console.log('SUBJECT:', subject);
          console.log('--------\n', content[0] && content[0].value, '\n--------');
          callback(null, null);
        }
      };
      console.warn('Using MOCK SendGrid instance -> emails will not be sent!');
    }
  }

  tmplFileName(tmplName) {
    return [ this.tmplDir, '/', tmplName, this.tmplSuffix ].filter(s => s).join('');
  }

  sgRequest(recipient, { from, fromname, subject }, msg) {
    return this.sendgrid.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: {
        personalizations: [{
          to: [{ email: recipient }],
        }],
        from: {
          email: from,
          name: fromname,
        },
        subject: subject,
        content: [{
          type: 'text/plain',
          value: wrap(72)(msg)
        }]
      }
    });
  }

  sendEmail(tmplName, data, done) {
    let tmplData = Object.assign({
      login_uri: loginUri(data.email, data.key, data.memberId)
    }, data);
    switch (tmplName) {

      case 'hugo-update-nominations':
        tmplData.nominations = nominationsString(data.nominations);
        break;

    }
    fs.readFile(this.tmplFileName(tmplName), 'utf8', (err, raw) => {
      if (err) return done(err);
      try {
        const {attributes, body} = tfm(raw);
        const msg = mustache.render(body, tmplData);
        const request = this.sgRequest(data.email, attributes, msg);
        this.sendgrid.API(request, (err, response) => {
          if (err) {
            console.warn('SendGrid error', response);
            done(err, response);
          } else {
            done(null, { to: data.email });
          }
        });
      } catch (err) {
        done(err);
      }
    });
  }
}

module.exports = Mailer;
