const fs = require('fs')
const mustache = require('mustache')
const path = require('path')
const tfm = require('tiny-frontmatter')
const wrap = require('wordwrap')
const { barcodeUri, loginUri } = require('./login-uri')
const sendgrid = require('./sendgrid')

const TEMPLATES_DIR = '/message-templates'
const WRAP_WIDTH = 78

function wrapIndented(prefix, str) {
  return prefix
    ? wrap(WRAP_WIDTH - prefix.length)(str).replace(/\n/g, '\n' + prefix)
    : wrap(WRAP_WIDTH)(str)
}

function applyCustomConfig(name, data) {
  const fn = path.resolve(process.cwd(), TEMPLATES_DIR, name)
  return new Promise((resolve, reject) => {
    try {
      const customFunction = require(fn)
      const customName = customFunction(data, wrapIndented)
      resolve(customName || name)
    } catch (error) {
      if (error && error.code === 'MODULE_NOT_FOUND') resolve(name)
      else reject(error)
    }
  })
}

function getTemplate(name) {
  const fn = path.resolve(process.cwd(), TEMPLATES_DIR, name + '.mustache')
  return new Promise((resolve, reject) => {
    fs.readFile(fn, 'utf8', (err, template) => {
      if (err) reject(err)
      else resolve(template)
    })
  })
}

function sgRequest(msgTemplate, data) {
  const {
    attributes: { from, fromname, subject },
    body
  } = tfm(msgTemplate)
  const to = [{ email: data.email }]
  if (data.name) to[0].name = data.name
  return sendgrid.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: {
      personalizations: [{ to }],
      from: {
        email: from,
        name: fromname
      },
      subject: mustache.render(subject, data),
      content: [
        {
          type: 'text/plain',
          value: wrap(WRAP_WIDTH)(mustache.render(body, data))
        }
      ]
    }
  })
}

function sendEmail(name, data) {
  data.barcode_uri = barcodeUri(data)
  data.login_uri = loginUri(data)
  return applyCustomConfig(name, data)
    .then(getTemplate)
    .then(template => {
      const request = sgRequest(template, data)
      return sendgrid.API(request)
    })
    .then(() => data.email)
}

module.exports = sendEmail
