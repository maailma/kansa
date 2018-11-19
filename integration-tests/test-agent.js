const fs = require('fs')
const path = require('path')
const request = require('supertest')
const WebSocket = require('ws')
const config = require('./kansa-config')

const caPath = path.resolve(__dirname, '../proxy/ssl/localhost.cert')
const ca = fs.readFileSync(caPath, 'utf8')
const host = 'localhost:4430'

module.exports = class KansaTestAgent extends request.agent {
  constructor() {
    super(`https://${host}`, { ca })
  }

  login(email, key) {
    return this.get('/api/login').query({ email, key })
  }
  loginAsAdmin() {
    return this.login('admin@example.com', 'key')
  }
  loginAsMember() {
    return this.login('member@example.com', 'key')
  }
  loginAsSiteSelectAdmin() {
    return this.login('site-select@example.com', 'key')
  }

  webSocket(path) {
    const sessionCookie = this.jar.getCookie(config.id, { path: '/' })
    return new WebSocket(`wss://${host}${path}`, {
      ca,
      headers: { Cookie: String(sessionCookie) }
    })
  }
}
