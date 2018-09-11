const assert = require('assert')
const fs = require('fs')
const request = require('supertest')
const WebSocket = require('ws')
const YAML = require('yaml').default

const config = YAML.parse(fs.readFileSync('../config/kansa.yaml', 'utf8'))
const ca = fs.readFileSync('../proxy/ssl/localhost.cert', 'utf8')
const host = 'localhost:4430'
const admin = request.agent(`https://${host}`, { ca })
const member = request.agent(`https://${host}`, { ca })

describe('People', () => {
  const origName = 'First Member'
  const altName = 'Member the First'

  let testId = null
  const testName = 'test-' + (Math.random().toString(36) + '000000').slice(2, 7)

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
    const email = 'admin@example.com'
    const key = 'key'
    return admin
      .get('/api/login')
      .query({ email, key })
      .expect('set-cookie', /w75/)
      .expect(200, { status: 'success', email })
      .then(() => admin.get('/api/user'))
      .then(res => {
        assert.notEqual(res.body.roles.indexOf('hugo_admin'), -1)
      })
  })

  describe('Member access', () => {
    it('get own data', () =>
      member
        .get(`/api/people/${id}`)
        .expect(200)
        .expect(res => {
          assert.equal(res.body.id, id)
          assert.equal(typeof res.body.email, 'string')
        }))

    it("fail to get other member's data", () =>
      member.get(`/api/people/${id - 1}`).expect(401))

    it('update own data', () =>
      member
        .post(`/api/people/${id}`)
        .send({ legal_name: altName })
        .expect(200, {
          status: 'success',
          updated: ['legal_name'],
          key_sent: false
        }))

    it('fail to update own email', () =>
      member
        .post(`/api/people/${id}`)
        .send({ email: 'member@example.com' })
        .expect(400))

    it("fail to update other member's data", () =>
      member
        .post(`/api/people/${id - 1}`)
        .send({ legal_name: 'Other Member' })
        .expect(401))

    it('get own previous names', () =>
      member
        .get(`/api/people/${id}/prev-names`)
        .expect(200)
        .expect(res => {
          assert(Array.isArray(res.body))
        }))

    it("fail to get other member's previous names", () =>
      member.get(`/api/people/${id - 1}/prev-names`).expect(401))

    it('fail to get previous names for all members', () =>
      member.get(`/api/people/prev-names.csv`).expect(401))

    it('fail to add new person', () =>
      member
        .post(`/api/people`)
        .send({
          email: `${testName}@example.com`,
          legal_name: testName,
          membership: 'NonMember'
        })
        .expect(401))

    it('fail to list all people', () => member.get(`/api/people`).expect(401))

    it('fail to list member emails', () =>
      member.get(`/api/people/member-emails`).expect(401))

    it('fail to list member paper pubs', () =>
      member.get(`/api/people/member-emails`).expect(401))

    it('fail to open WebSocket connection for people updates', done => {
      const sessionCookie = member.jar.getCookie(config.id, { path: '/' })
      const ws = new WebSocket(`wss://${host}/api/people/updates`, {
        ca,
        headers: { Cookie: String(sessionCookie) }
      })
      ws.onclose = ev => {
        if (ev.code === 4001) done()
        else done(new Error(`Unexpected close event ${ev.code} ${ev.reason}`))
      }
      ws.onerror = done
      ws.onmessage = ({ data }) => {
        throw new Error(`Unexpected message! ${data}`)
      }
    })
  })

  describe('Admin access', () => {
    it('get member data', () =>
      admin
        .get(`/api/people/${id}`)
        .expect(200)
        .expect(res => {
          assert.equal(res.body.id, id)
          assert.equal(typeof res.body.email, 'string')
        }))

    it('update member data', () =>
      admin
        .post(`/api/people/${id}`)
        .send({ email: 'member@example.com', legal_name: origName })
        .expect(200, {
          status: 'success',
          updated: ['legal_name', 'email'],
          key_sent: false
        }))

    it('get previous names for one member', () =>
      admin
        .get(`/api/people/${id}/prev-names`)
        .expect(200)
        .expect(res => {
          assert(Array.isArray(res.body))
          assert(res.body.some(p => p.prev_legal_name === altName))
        }))

    it('get previous names for all members as CSV', () =>
      admin
        .get(`/api/people/prev-names.csv`)
        .expect(200)
        .expect('Content-Type', 'text/csv; charset=utf-8'))

    it('get previous names for all members as JSON', () =>
      admin
        .get(`/api/people/prev-names.json`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(res => {
          assert(Array.isArray(res.body))
          assert(res.body.some(p => p.prev_name === altName))
        }))

    it('add new person', () =>
      admin
        .post(`/api/people`)
        .send({
          email: `${testName}@example.com`,
          legal_name: testName,
          membership: 'NonMember'
        })
        .expect(200)
        .expect(res => {
          assert.equal(res.body.status, 'success')
          assert.equal(typeof res.body.id, 'number')
          testId = res.body.id
        }))

    it('list all people', () =>
      admin
        .get(`/api/people`)
        .expect(200)
        .expect(res => {
          assert(Array.isArray(res.body))
          assert(res.body.some(p => p && p.legal_name === origName))
          assert(
            res.body.some(
              p => p && p.id === testId && p.legal_name === testName
            )
          )
        }))

    it('list member emails', () =>
      admin
        .get(`/api/people/member-emails`)
        .expect(200)
        .expect('Content-Type', 'text/csv; charset=utf-8')
        .expect(res => {
          assert(/member@example.com/.test(res.text))
        }))

    it('list member paper pubs', () =>
      admin
        .get(`/api/people/member-paperpubs`)
        .expect(200)
        .expect('Content-Type', 'text/csv; charset=utf-8'))

    it('WebSocket: people updates', done => {
      const sessionCookie = admin.jar.getCookie(config.id, { path: '/' })
      const ws = new WebSocket(`wss://${host}/api/people/updates`, {
        ca,
        headers: { Cookie: String(sessionCookie) }
      })
      let ok = false
      ws.onclose = () => {
        if (ok) done()
        else done(new Error('WebSocket closed before message received'))
      }
      ws.onerror = done
      ws.onmessage = ({ data }) => {
        const obj = JSON.parse(data)
        assert.equal(obj.id, testId)
        assert.equal(obj.legal_name, testName)
        ok = true
        ws.close()
      }
      ws.onopen = () =>
        admin
          .post(`/api/people/${testId}`)
          .send({ email: `${testName}@example.org` })
          .expect(200, {
            status: 'success',
            updated: ['email'],
            key_sent: false
          })
          .catch(done)
    })
  })
})
