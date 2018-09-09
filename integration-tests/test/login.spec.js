const host = 'https://localhost:4430'
const request = require('supertest')
const assert = require('assert')
const fs = require('fs')

// Create agent for unlogged and admin sessions
const ca = fs.readFileSync('../proxy/ssl/localhost.cert', 'utf8')
const unlogged = request.agent(host, { ca })
const admin = request.agent(host, { ca })
const loginparams = { email: 'admin@example.com', key: 'key' }

describe('Check that API services are up', function() {
  this.timeout(120000)
  this.retries(10)

  afterEach(function(done) {
    if (this.currentTest.state !== 'passed') {
      setTimeout(done, 2000)
    } else {
      done()
    }
  })

  it('Should respond with json on api/', () =>
    unlogged.get('/api/').expect('Content-Type', /json/))

  it('Should respond with json on api/hugo/', () =>
    unlogged.get('/api/hugo/').expect('Content-Type', /json/))
})

describe('Public data', () => {
  it('Member list is an array', () =>
    unlogged
      .get('/api/public/people')
      .expect(200)
      .expect(res => {
        assert(Array.isArray(res.body))
      }))

  it('Country statistics includes totals', () =>
    unlogged
      .get('/api/public/stats')
      .expect(200)
      .expect(res => {
        assert(res.body['='].hasOwnProperty('='))
      }))

  it('Configuration is an object with id, name', () =>
    unlogged
      .get('/api/config')
      .expect(200)
      .expect(res => {
        assert(!!res.body.id)
        assert(!!res.body.name)
      }))
})

describe('Login', () => {
  context('Successful login', () => {
    it('gets a session cookie or it gets the hose again.', () =>
      admin
        .get('/api/login')
        .query(loginparams)
        .expect('set-cookie', /w75/)
        .expect(200, { status: 'success', email: loginparams.email }))

    it('gets user information', () => admin.get('/api/user').expect(200))
  })

  context('Login with wrong email', () => {
    it('gets 401 response', () =>
      unlogged
        .get('/api/login')
        .query({ email: 'foo@doo.com', key: loginparams.key })
        .expect(401))

    it('gets unauthorized from /api/user', () =>
      unlogged.get('/api/user').expect(401))
  })

  context('Login with wrong key', () => {
    it('gets 401 response', () =>
      unlogged
        .get('/api/login')
        .query({ email: loginparams.email, key: 'foo' })
        .expect(401))

    it('gets unauthorized from /api/user', () =>
      unlogged.get('/api/user').expect(401))
  })

  context('Login with expired key', () => {
    it('gets 403 response', () => {
      const email = 'expired@example.com'
      return unlogged
        .get('/api/login')
        .query({ email, key: 'key' })
        .expect(403, { email, status: 'expired' })
    })

    it('gets unauthorized from /api/user', () =>
      unlogged.get('/api/user').expect(401))
  })
})

describe('Logout', () => {
  const testagent = request.agent(host, { ca })

  before(() =>
    testagent
      .get('/api/login')
      .query(loginparams)
      .expect('set-cookie', /w75/)
      .expect(200, { status: 'success', email: loginparams.email })
  )

  context('Successful logout', () => {
    it('should be successful', () =>
      testagent
        .get('/api/logout')
        .expect(200, { status: 'success', email: loginparams.email }))

    it('gets unauthorized from /api/user', () =>
      testagent.get('/api/user').expect(401))
  })

  context('Not logged in', () => {
    it('logout should be unauthorized', () =>
      unlogged.get('/api/logout').expect(401))

    it('gets unauthorized from /api/user', () =>
      testagent.get('/api/user').expect(401))
  })
})

describe('Key request', () => {
  before(() =>
    admin
      .get('/api/logout')
      .expect(200, { status: 'success', email: loginparams.email })
  )

  context('Should not reset by default', () => {
    it('should be successful', () =>
      admin
        .post('/api/key')
        .send({ email: loginparams.email })
        .expect(200, { status: 'success', email: loginparams.email }))

    it('should still be able to login', () =>
      admin
        .get('/api/login')
        .query(loginparams)
        .expect('set-cookie', /w75/)
        .expect(200, { status: 'success', email: loginparams.email }))
  })

  context('Account creation', () => {
    const agent = request.agent(host, { ca })
    const testName =
      'test-' + (Math.random().toString(36) + '00000000000000000').slice(2, 7)
    const testEmail = testName + '@example.com'

    it('Should create non-member accounts', () =>
      agent
        .post('/api/key')
        .send({ email: testEmail, name: testName })
        .expect(200, { status: 'success', email: testEmail }))
  })
})
