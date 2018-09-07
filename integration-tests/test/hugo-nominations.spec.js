const assert = require('assert')
const fs = require('fs')
const request = require('supertest')

const host = 'https://localhost:4430'
const ca = fs.readFileSync('../nginx/ssl/localhost.cert', 'utf8')
const admin = request.agent(host, { ca })
const nominator = request.agent(host, { ca })

const randomString = () => (Math.random().toString(36) + '0000000').slice(2, 7)

describe('Hugo nominations', () => {
  const category = 'Novel'
  const signature = randomString()
  const author = randomString()
  const otherAuthor = randomString()

  let id = null
  before(() => {
    const email = 'member@example.com'
    const key = 'key'
    return nominator
      .get('/api/login')
      .query({ email, key })
      .expect('set-cookie', /w75/)
      .expect(200, { status: 'success', email })
      .then(() => nominator.get('/api/user'))
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

  it('nominator: add nomination', () => {
    return nominator
      .post(`/api/hugo/${id}/nominate`)
      .send({ signature, category, nominations: [{ author: otherAuthor }] })
      .expect(200)
      .expect(res => {
        assert.equal(typeof res.body, 'object')
        assert.equal(res.body.status, 'success')
        assert.equal(res.body.person_id, id)
        assert.equal(res.body.signature, signature)
        assert.equal(res.body.nominations[0].author, otherAuthor)
      })
  })

  it('nominator: update nomination', () => {
    return nominator
      .post(`/api/hugo/${id}/nominate`)
      .send({
        signature,
        category,
        nominations: [{ author }, { author: otherAuthor }]
      })
      .expect(200)
      .expect(res => {
        assert.equal(typeof res.body, 'object')
        assert.equal(res.body.status, 'success')
        assert.equal(res.body.person_id, id)
        assert.equal(res.body.signature, signature)
        assert.equal(res.body.nominations[0].author, author)
      })
  })

  it("nominator: do not add others' nomination", () => {
    return nominator
      .post(`/api/hugo/${id - 1}/nominate`)
      .send({ signature, category, nominations: [{ author }] })
      .expect(401)
  })

  it('nominator: list own nominations', () =>
    nominator
      .get(`/api/hugo/${id}/nominations`)
      .expect(200)
      .expect(res => {
        assert(Array.isArray(res.body))
        const c = res.body.find(c => c.category === category)
        assert.equal(c.signature, signature)
      }))

  it("nominator: do not list others' nominations", () =>
    nominator.get(`/api/hugo/${id - 1}/nominations`).expect(401))

  it('admin: list all ballots', () =>
    admin.get('/api/hugo/admin/ballots').then(res => {
      const n = res.body[category].find(n => n[0] === id)
      assert.equal(n[1][0].author, author)
    }))

  it('admin: list all ballots for one category', () =>
    admin
      .get(`/api/hugo/admin/ballots/${category}`)
      .expect(200)
      .then(res => {
        const n = res.body.find(n => n[0] === id)
        assert.equal(n[1][0].author, author)
      }))

  it('admin: get nominations', () =>
    admin
      .get('/api/hugo/admin/nominations')
      .expect(200)
      .then(res => {
        const n = res.body[category].find(n => n[0].author === author)
        assert(Array.isArray(n))
        assert(n.length === 1)
      }))

  it('admin: classify nominations', () =>
    admin
      .post('/api/hugo/admin/classify')
      .send({
        category,
        nominations: [{ author }, { author: otherAuthor }],
        canon_nom: { author: otherAuthor }
      })
      .expect(200, { status: 'success' }))

  let canonId = null
  it('admin: get canon', () =>
    admin
      .get('/api/hugo/admin/canon')
      .expect(200)
      .then(res => {
        const c = res.body[category].find(
          c => c.nomination.author === otherAuthor
        )
        assert.equal(c && typeof c.id, 'number')
        canonId = c.id
      }))

  it('admin: update canon entry', () =>
    admin
      .post(`/api/hugo/admin/canon/${canonId}`)
      .send({ category, nomination: { author }, disqualified: true })
      .expect(200, { status: 'success' }))

  it('admin: get updated canon', () =>
    admin
      .get('/api/hugo/admin/canon')
      .expect(200)
      .then(res => {
        const c = res.body[category].find(c => c.nomination.author === author)
        assert(c.disqualified)
      }))

  it('admin: get canonized nominations', () =>
    admin
      .get('/api/hugo/admin/nominations')
      .expect(200)
      .then(res => {
        const n = res.body[category].find(n => n[0].author === author)
        assert(Array.isArray(n))
        assert.equal(typeof n[1], 'number')
        const o = res.body[category].find(n => n[0].author === otherAuthor)
        assert(Array.isArray(o))
        assert.equal(o[1], n[1])
      }))
})
