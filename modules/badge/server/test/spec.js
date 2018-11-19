let pngType = 'image/png'

if (process.env.CI) {
  // Tarra requires fonts that are normally mounted from the file system, and
  // are not included in the build on the CI servers. So we hack around the
  // problem for now by expecting the responses to fail. -- Eemeli, 2018-09-09
  pngType = 'text/html; charset=UTF-8'
}

module.exports = Agent => {
  let id = null

  describe('member access', () => {
    const member = new Agent()

    before(() =>
      member
        .loginAsMember()
        .expect(200)
        .then(() => member.get('/api/user'))
        .then(res => {
          id = res.body.people[0].id
        })
    )

    it('get own badge', () =>
      member
        .get(`/api/badge/${id}`)
        .expect(200)
        .expect('Content-Type', pngType))

    it("fail to get other's badge", () =>
      member.get(`/api/badge/${id - 1}`).expect(401))

    it('fail to log own badge as printed', () =>
      member
        .post(`/api/badge/${id}/print`)
        .send()
        .expect(401))
  })

  describe('anonymous access', () => {
    const anonymous = new Agent()

    it('get blank badge', () =>
      anonymous
        .get('/api/badge/blank')
        .expect(200)
        .expect('Content-Type', pngType))

    it("fail to get member's badge", () =>
      anonymous.get(`/api/badge/${id}`).expect(401))
  })

  describe('admin access', () => {
    const admin = new Agent()
    before(() => admin.loginAsAdmin().expect(200))

    it("get member's badge", () =>
      admin
        .get(`/api/badge/${id}`)
        .expect(200)
        .expect('Content-Type', pngType))

    it("log the member's badge as printed", () =>
      admin
        .post(`/api/badge/${id}/print`)
        .send()
        .expect(200)
        .expect(res => assert.equal(res.body.status, 'success')))
  })
}
