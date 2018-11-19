const assert = require('assert')
const Agent = require('../test-agent')

describe('Public data', () => {
  const agent = new Agent()

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
