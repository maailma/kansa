const fs = require('fs');
const mustache = require('mustache');
const SendGrid  = require('sendgrid');
const tfm = require('tiny-frontmatter');
const wrap = require('wordwrap');

const WRAP_WIDTH = 78;

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
      return '  - ' + wrap(WRAP_WIDTH - 4)(ns).replace(/\n/g, '\n    ');
    });
    return `${ct}:\n${cn.join('\n')}`;
  }).join('\n\n');
}

function votesString(data) {
  return data
    .map(({ category, finalists }) => ({
      title: category.charAt(0) + category.slice(1).replace(/[A-Z]/g, ' $&'),
      votes: finalists && finalists.filter(finalist => finalist).map((finalist, i) => {
        return `  ${i+1}. ` + wrap(WRAP_WIDTH - 4)(finalist).replace(/\n/g, '\n     ');
      })
    }))
    .filter(({ votes }) => votes && votes.length > 0)
    .map(({ title, votes }) => `${title}:\n${votes.join('\n')}`)
    .join('\n\n');
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
        API: ({ body: { content, from, personalizations, subject }, method, path }, callback) => {
          console.log('MOCK SendGrid request', method, path);
          console.log('FROM:', JSON.stringify(from.name), `<${from.email}>`);
          console.log('TO:', JSON.stringify(personalizations[0].to[0]));
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

  sgRequest(msgTemplate, data) {
    const { attributes: { from, fromname, subject }, body } = tfm(msgTemplate);
    const to = [{ email: data.email }];
    if (data.name) to[0].name = data.name;
    return this.sendgrid.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: {
        personalizations: [{ to }],
        from: {
          email: from,
          name: fromname,
        },
        subject: mustache.render(subject, data),
        content: [{
          type: 'text/plain',
          value: wrap(WRAP_WIDTH)(mustache.render(body, data))
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

      case 'hugo-update-votes':
        tmplData.votes = votesString(data.votes);
        break;

      case 'kansa-upgrade-person':
        if (data.paper_pubs) tmplData.membership += ' with paper pubs';
        break;

    }
    fs.readFile(this.tmplFileName(tmplName), 'utf8', (err, msgTemplate) => {
      if (err) return done(err);
      try {
        const request = this.sgRequest(msgTemplate, tmplData);
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
