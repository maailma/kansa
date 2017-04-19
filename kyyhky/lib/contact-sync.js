var ContactImporter = require('sendgrid/lib/helpers/contact-importer/contact-importer')
const debug = require('debug')('kyyhky:sync')
const loginUri = require('./login-uri');

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
    this.recipientIds = null
    this.recipients = null
  }

  sgThrottleAPI(request, response = {}) {
    const throttle = ({ headers }) => {
      if (!headers || headers['x-ratelimit-remaining']) return Promise.resolve()
      const nextTime = headers['x-ratelimit-reset'] * 1000
      const nowTime = new Date(headers.date).getTime()
      const delay = Math.max(nextTime - nowTime + 100, 1000)
      debug('sgThrottleAPI delay', delay)
      return new Promise(resolve => setTimeout(resolve, delay))
    }
    let next
    const onError = (err) => {
      if (err.response && err.response.statusCode === 429) {
        return throttle(err.response).then(next)
      } else {
        throw err
      }
    }
    next = () => this.sendgrid.API(request).catch(onError)
    return throttle(response).then(next)
  }

  getRecipients() {
    if (this.fetching) return Promise.reject(new Error('fetching'))
    if (this.recipients) return Promise.resolve(this.recipients)
    this.fetching = true
    const request = this.sendgrid.emptyRequest({
      method: 'GET',
      path: '/v3/contactdb/recipients',
      queryParams: {
        page: 1,
        page_size: 1000
      }
    })
    let recipients = []
    const onSuccess = (response) => {
      debug('getRecipients request', request.queryParams.page)
      recipients = recipients.concat(JSON.parse(response.body).recipients)
      request.queryParams.page += 1
      return this.sgThrottleAPI(request, response)
        .then(onSuccess)
    }
    return this.sgThrottleAPI(request)
      .then(onSuccess)
      .catch((err) => {
        this.fetching = false
        if (err.response && err.response.statusCode === 404) {
          this.recipientIds = recipients.reduce((map, r) => {
            map[r.email] = r.id
            return map
          }, {})
          debug('getRecipients done', this.recipientIds.length)
          return this.recipients = recipients.map(recipient)
        } else {
          debug('getRecipients error', err, err.response)
          throw err
        }
      })
  }

  sync(data, done) {
    debug('sync', data && data.length)
    this.getRecipients()
      .then(recipients => {
        if (this.queue) {
          data = this.queue.concat(data)
          this.queue = null
        }
        const deletes = []
        const updates = data.filter(rx => {
          if (!rx) return false
          if (rx.delete) {
            const id = this.recipientIds[rx.email]
            if (id) {
              deletes.push(id)
              const prevIdx = recipients.findIndex(r => r.email === rx.email)
              if (prevIdx !== -1) delete recipients[prevIdx]
            }
            return false
          }
          rx.login_url = loginUri(rx)
          rx.hugo_login_url = rx.hugo_id ? loginUri(Object.assign({ memberId: rx.hugo_id }, rx)) : null
          delete rx.hugo_id
          delete rx.key
          const prev = recipients.find(r => r.email === rx.email)
          if (!prev) {
            recipients.push(rx)
            return true
          }
          const keys = Object.keys(rx)
          if (
            keys.length !== Object.keys(prev).length ||
            keys.some(key => rx[key] !== prev[key])
          ) {
            Object.keys(prev).forEach(key => delete prev[key])
            Object.assign(prev, rx)
            return true
          }
        })
        debug('update', updates.length, 'and delete', deletes.length)
        if (updates.length) this.contactImporter.push(updates)
        if (deletes.length) {
          const request = this.sendgrid.emptyRequest({
            method: 'DELETE',
            path: '/v3/contactdb/recipients',
            body: deletes
          })
          return this.sendgrid.API(request)
        }
      })
      .then(done)
      .catch(err => {
        if (err.message === 'fetching') {
          debug('sync fetching, queued', data && data.length)
          this.queue = this.queue ? this.queue.concat(data) : data
          done()
        } else {
          done(err)
        }
      })
  }
}

module.exports = ContactSync
