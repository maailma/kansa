const assert = require('assert')
const config = require('../kansa-config')
const Agent = require('../test-agent')

const admin = new Agent()
const member = new Agent()

if (!config.modules.siteselect) return

describe('Site selection', () => {
  let id = null
  before(() =>
    member
      .loginAsMember()
      .expect(200)
      .then(() => member.get('/api/user'))
      .then(res => {
        id = res.body.people[0].id
      })
  )

  before(() =>
    admin
      .loginAsSiteSelectAdmin()
      .expect(200)
      .then(() => admin.get('/api/user'))
      .then(res => {
        assert.notEqual(res.body.roles.indexOf('siteselection'), -1)
      })
  )

  it('member: get own ballot', () =>
    member
      .get(`/api/siteselect/${id}/ballot`)
      .expect(200)
      .expect('Content-Type', 'application/pdf'))

  it("member: fail to get others' ballot", () =>
    member.get(`/api/siteselect/${id - 1}/ballot`).expect(401))

  it('member: fail to list tokens', () =>
    member.get(`/api/siteselect/tokens.json`).expect(401))

  it('member: fail to list voters', () =>
    member.get(`/api/siteselect/voters.json`).expect(401))

  it('admin: get member ballot', () =>
    admin
      .get(`/api/siteselect/${id}/ballot`)
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
