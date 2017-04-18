var ContactImporter = require('sendgrid/lib/helpers/contact-importer/contact-importer')

const recipient = (src) => {
  const rx = { email: src.email }
  src.custom_fields.forEach(cf => rx[cf.name] = cf.value)
  return rx
}

class ContactSync {
  constructor(sendgrid) {
    this.sendgrid = sendgrid
    this.contactImporter = new ContactImporter(sendgrid)
    this.fetching = false
    this.queue = null
    this.recipients = null
  }

  getRecipients() {
    if (this.fetching) return new Promise.reject(new Error('fetching'))
    if (this.recipients) return new Promise.resolve(this.recipients)
    this.fetching = true
    const request = this.sendgrid.emptyRequest({
      method: 'GET',
      path: '/v3/contactdb/recipients',
      page: 1,
      page_size: 1000
    })
    let recipients = []
    const onSuccess = (response) => {
      recipients = recipients.concat(response.recipients.map(recipient))
      request.page += 1
      return this.sendgrid.API(request).then(onSuccess)
    }
    return this.sendgrid.API(request).then(onSuccess)
      .catch(err => {
        this.fetching = false
        if (err.response.statusCode === 404) {
          return this.recipients = recipients
        } else {
          throw err
        }
      })
  }

  sync(data, done) {
    this.getRecipients()
      .then(recipients => {
        if (this.queue) {
          data = this.queue.concat(data)
          this.queue = null
        }
        const updates = data.filter(rx => {
          if (!rx) return false
          const keys = Object.keys(rx)
          const prev = recipients.find(r => r.email === rx.email)
          if (!prev) {
            recipients.push(rx)
            return true
          }
          if (
            keys.length !== Object.keys(prev).length ||
            keys.some(key => a[key] !== b[key])
          ) {
            Object.keys(prev).forEach(key => delete prev[key])
            Object.assign(prev, rx)
            return true
          }
        })
        if (updates.length) this.contactImporter.push(updates)
      })
      .catch(err => {
        if (err.message === 'fetching') {
          this.queue = this.queue ? this.queue.concat(data) : data
        } else {
          console.error(err)
        }
      })
  }
}

module.exports = ContactSync
