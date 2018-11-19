const assert = require('assert')
const Agent = require('../test-agent')

const unlogged = new Agent()
const admin = new Agent()
const email = 'admin@example.com'

describe('Configuration', () => {
  it('Configuration is an object with id, name', () =>
    unlogged
      .get('/api/config')
      .expect(200)
      .expect(res => {
        assert(typeof res.body.id, 'string')
        assert(typeof res.body.name, 'string')
      }))
})

describe('Login', () => {
  context('Successful login', () => {
    it('gets a session cookie or it gets the hose again.', () =>
      admin
        .loginAsAdmin()
        .expect('set-cookie', /w75/)
        .expect(200, { status: 'success', email }))

    it('gets user information', () => admin.get('/api/user').expect(200))
  })

  context('Login with wrong email', () => {
    it('gets 401 response', () =>
      unlogged.login('foo@doo.com', 'key').expect(401))

    it('gets unauthorized from /api/user', () =>
      unlogged.get('/api/user').expect(401))
  })

  context('Login with wrong key', () => {
    it('gets 401 response', () => unlogged.login(email, 'foo').expect(401))

    it('gets unauthorized from /api/user', () =>
      unlogged.get('/api/user').expect(401))
  })

  context('Login with expired key', () => {
    it('gets 403 response', () =>
      unlogged.login('expired@example.com', 'key').expect(403))

    it('gets unauthorized from /api/user', () =>
      unlogged.get('/api/user').expect(401))
  })
})

describe('Logout', () => {
  const agent = new Agent()

  before(() =>
    agent
      .loginAsAdmin()
      .expect('set-cookie', /w75/)
      .expect(200, { status: 'success', email })
  )

  context('Successful logout', () => {
    it('should be successful', () =>
      agent.get('/api/logout').expect(200, { status: 'success', email }))

    it('gets unauthorized from /api/user', () =>
      agent.get('/api/user').expect(401))
  })

  context('Not logged in', () => {
    it('logout should be unauthorized', () =>
      unlogged.get('/api/logout').expect(401))

    it('gets unauthorized from /api/user', () =>
      agent.get('/api/user').expect(401))
  })
})

describe('Key request', () => {
  before(() =>
    admin.get('/api/logout').expect(200, { status: 'success', email })
  )

  context('Should not reset by default', () => {
    it('should be successful', () =>
      admin
        .post('/api/key')
        .send({ email })
        .expect(200, { status: 'success', email }))

    it('should still be able to login', () =>
      admin
        .loginAsAdmin()
        .expect('set-cookie', /w75/)
        .expect(200, { status: 'success', email }))
  })

  context('Account creation', () => {
    const agent = new Agent()
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
