const assert = require('assert')
const fs = require('fs')
const request = require('supertest')

const ca = fs.readFileSync('../proxy/ssl/localhost.cert', 'utf8')
const host = 'localhost:4430'
const admin = request.agent(`https://${host}`, { ca })
const member = request.agent(`https://${host}`, { ca })

describe('Site selection', () => {
  let id = null
  before(() => {
    const email = 'member@example.com'
    const key = 'key'
    return member
      .get('/api/login')
      .query({ email, key })
      .expect('set-cookie', /w75/)
      .expect(200, { status: 'success', email })
      .then(() => member.get('/api/user'))
      .then(res => {
        id = res.body.people[0].id
        assert.equal(typeof id, 'number')
      })
  })

  before(() => {
    const email = 'site-select@example.com'
    const key = 'key'
    return admin
      .get('/api/login')
      .query({ email, key })
      .expect('set-cookie', /w75/)
      .expect(200, { status: 'success', email })
      .then(() => admin.get('/api/user'))
      .then(res => {
        assert.notEqual(res.body.roles.indexOf('siteselection'), -1)
      })
  })

  it('member: get own ballot', () =>
    member
      .get(`/api/people/${id}/ballot`)
      .expect(200)
      .expect('Content-Type', 'application/pdf'))

  it("member: fail to get others' ballot", () =>
    member.get(`/api/people/${id - 1}/ballot`).expect(401))

  it('member: fail to list tokens', () =>
    member.get(`/api/siteselect/tokens.json`).expect(401))

  it('member: fail to list voters', () =>
    member.get(`/api/siteselect/voters.json`).expect(401))

  it('admin: get member ballot', () =>
    admin
      .get(`/api/people/${id}/ballot`)
      .expect(200)
      .expect('Content-Type', 'application/pdf'))

  it('admin: list tokens as JSON', () =>
    admin
      .get(`/api/siteselect/tokens.json`)
      .expect(200)
      .expect(res => assert(Array.isArray(res.body))))

  it('admin: list tokens as CSV', () =>
    admin
      .get(`/api/siteselect/tokens.csv`)
      .expect(200)
      .expect('Content-Type', /text\/csv/))

  it('admin: list voters as JSON', () =>
    admin
      .get(`/api/siteselect/voters.json`)
      .expect(200)
      .expect(res => assert(Array.isArray(res.body))))

  it('admin: list voters as CSV', () =>
    admin
      .get(`/api/siteselect/voters.csv`)
      .expect(200)
      .expect('Content-Type', /text\/csv/))
})
