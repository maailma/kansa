const assert = require('assert')
const fs = require('fs')
const request = require('supertest')
//const YAML = require('yaml').default

//const config = YAML.parse(fs.readFileSync('../config/kansa.yaml', 'utf8'))
const ca = fs.readFileSync('../proxy/ssl/localhost.cert', 'utf8')
const host = 'localhost:4430'

describe('Badges & barcodes', () => {
  const key = 'key'
  let id = null

  describe('member access', () => {
    const member = request.agent(`https://${host}`, { ca })

    before(() => {
      const email = 'member@example.com'
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

    it('get own badge', () =>
      member
        .get(`/api/people/${id}/badge`)
        .expect(200)
        .expect('Content-Type', 'image/png'))

    it("fail to get other's badge", () =>
      member.get(`/api/people/${id - 1}/badge`).expect(401))

    it('get own barcode with id as PNG', () =>
      member
        .get(`/api/people/${id}/barcode.png`)
        .expect(200)
        .expect('Content-Type', 'image/png'))

    it('get own barcode with id as PDF', () =>
      member
        .get(`/api/people/${id}/barcode.pdf`)
        .expect(200)
        .expect('Content-Type', 'application/pdf'))

    it('fail to log own badge as printed', () =>
      member
        .post(`/api/people/${id}/print`)
        .send()
        .expect(401))
  })

  describe('anonymous access', () => {
    const anonymous = request.agent(`https://${host}`, { ca })

    it('get blank badge', () =>
      anonymous
        .get('/api/blank-badge')
        .expect(200)
        .expect('Content-Type', 'image/png'))

    it("fail to get member's badge", () =>
      anonymous.get(`/api/people/${id}/badge`).expect(401))

    it("get member's barcode with key as PNG", () =>
      anonymous
        .get(`/api/barcode/${key}/${id}.png`)
        .expect(200)
        .expect('Content-Type', 'image/png'))

    it("get member's barcode with key as PDF", () =>
      anonymous
        .get(`/api/barcode/${key}/${id}.pdf`)
        .expect(200)
        .expect('Content-Type', 'application/pdf'))
  })

  describe('admin access', () => {
    const admin = request.agent(`https://${host}`, { ca })
    before(() => {
      const email = 'admin@example.com'
      return admin
        .get('/api/login')
        .query({ email, key })
        .expect('set-cookie', /w75/)
        .expect(200, { status: 'success', email })
        .then(() => admin.get('/api/user'))
        .then(res => {
          assert.notEqual(res.body.roles.indexOf('member_admin'), -1)
        })
    })

    it("get member's badge", () =>
      admin
        .get(`/api/people/${id}/badge`)
        .expect(200)
        .expect('Content-Type', 'image/png'))

    it("get member's barcode with id as PNG", () =>
      admin
        .get(`/api/people/${id}/barcode.png`)
        .expect(200)
        .expect('Content-Type', 'image/png'))

    it("get member's barcode with id as PDF", () =>
      admin
        .get(`/api/people/${id}/barcode.pdf`)
        .expect(200)
        .expect('Content-Type', 'application/pdf'))

    it("log the member's badge as printed", () =>
      admin
        .post(`/api/people/${id}/print`)
        .send()
        .expect(200)
        .expect(res => assert.equal(res.body.status, 'success')))
  })
})
