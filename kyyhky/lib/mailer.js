const fs = require('fs');
const mustache = require('mustache');
const tfm = require('tiny-frontmatter');
const wrap = require('wordwrap');
const loginUri = require('./login-uri');

const WRAP_WIDTH = 78;

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

function paymentDataString(data, shape) {
  if (!data) return '';
  const label = (key) => shape && shape[key] && shape[key].label || key;
  return Object.keys(data)
    .filter(key => key && data[key])
    .map(key => `${label(key)}: ${data[key]}`)
    .join('\n');
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
  constructor(tmplDir, tmplSuffix, sendgrid) {
    this.sendgrid = sendgrid;
    this.tmplDir = tmplDir;
    this.tmplSuffix = tmplSuffix;
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
    let tmplData = Object.assign({ login_uri: loginUri(data) }, data);
    switch (tmplName) {

      case 'hugo-update-nominations':
        tmplData.nominations = nominationsString(data.nominations);
        break;

      case 'hugo-update-votes':
        tmplData.votes = votesString(data.votes);
        break;

      case 'kansa-new-payment':
        if (data.type === 'ss-token') {
          tmplName = 'kansa-new-siteselection-token';
        }
        tmplData.data = paymentDataString(data.data, data.shape);
        tmplData.strAmount = data.currency.toUpperCase() + ' ' + (data.amount / 100).toFixed(2);
        break;

      case 'kansa-upgrade-person':
        if (data.paper_pubs) tmplData.membership += ' with paper pubs';
        break;

    }
    fs.readFile(this.tmplFileName(tmplName), 'utf8', (err, msgTemplate) => {
      if (err) return done(err);
      const request = this.sgRequest(msgTemplate, tmplData);
      this.sendgrid.API(request)
        .then(() => done(null, { to: data.email }))
        .catch(done)
    });
  }
}

module.exports = Mailer;
