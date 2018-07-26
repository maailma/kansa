const fs = require('fs');
const mustache = require('mustache');
const path = require('path');
const tfm = require('tiny-frontmatter');
const wrap = require('wordwrap');
const { barcodeUri, loginUri } = require('./login-uri');
const sendgrid = require('./sendgrid')

const TEMPLATES_DIR = '/message-templates'
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

function paymentDataString(data, shape, ignored) {
  if (!data) return '';
  const label = (key) => shape && (shape.find(s => s.key === key) || {}).label || key;
  return Object.keys(data)
    .filter(key => key && data[key] && !ignored[key])
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

function getTemplate(name) {
  const fn = path.resolve(process.cwd(), TEMPLATES_DIR, name + '.mustache')
  return new Promise((resolve, reject) => {
    fs.readFile(fn, 'utf8', (err, template) => {
      if (err) reject(err);
      else resolve(template);
    })
  })
}

function sgRequest(msgTemplate, data) {
  const { attributes: { from, fromname, subject }, body } = tfm(msgTemplate);
  const to = [{ email: data.email }];
  if (data.name) to[0].name = data.name;
  return sendgrid.emptyRequest({
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

function sendEmail(tmplName, data) {
  let tmplData = Object.assign({
    barcode_uri: barcodeUri(data),
    login_uri: loginUri(data)
  }, data);
  switch (tmplName) {

    case 'hugo-packet-series-extra':
      tmplData = {
        email: 'hugos@choiceofgames.com',
        voter_email: data.email
      }
      break;

    case 'hugo-update-nominations':
      tmplData.nominations = nominationsString(data.nominations);
      break;

    case 'hugo-update-votes':
      tmplData.votes = votesString(data.votes);
      break;

    case 'kansa-new-payment':
    case 'kansa-update-payment':
      if (data.type === 'ss-token' && data.status === 'succeeded') {
        tmplName = 'kansa-new-siteselection-token';
      }
      tmplData.data = paymentDataString(data.data, data.shape, { mandate_url: true });
      tmplData.strAmount = data.currency.toUpperCase() + ' ' + (data.amount / 100).toFixed(2);
      break;

    case 'kansa-upgrade-person':
      if (data.paper_pubs) tmplData.membership += ' with paper pubs';
      break;

  }
  return getTemplate(tmplName)
    .then(msgTemplate => {
      const request = sgRequest(msgTemplate, tmplData);
      return sendgrid.API(request)
    })
    .then(() => data.email)
}

module.exports = sendEmail;
