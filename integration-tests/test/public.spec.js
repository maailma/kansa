const assert = require('assert')
const fs = require('fs')
const request = require('supertest')

const ca = fs.readFileSync('../proxy/ssl/localhost.cert', 'utf8')
const host = 'localhost:4430'
const agent = request.agent(`https://${host}`, { ca })

describe('Public data', () => {
  it('Member list is an array', () =>
    agent
      .get('/api/public/people')
      .expect(200)
      .expect(res => {
        assert(Array.isArray(res.body))
      }))

  it('Daypass statistics is an object', () =>
    agent
      .get('/api/public/daypass-stats')
      .expect(200)
      .expect(res => {
        assert(res.text.trim().length > 0)
        assert.equal(typeof res.body, 'object')
      }))

  it('Country statistics includes totals', () =>
    agent
      .get('/api/public/stats')
      .expect(200)
      .expect(res => {
        assert(res.body['='].hasOwnProperty('='))
      }))
})
