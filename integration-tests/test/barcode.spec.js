const config = require('../kansa-config')
const Agent = require('../test-agent')

if (!config.modules.barcode) return

let pdfType = 'application/pdf'
let pngType = 'image/png'

if (process.env.CI) {
  // Tarra requires fonts that are normally mounted from the file system, and
  // are not included in the build on the CI servers. So we hack around the
  // problem for now by expecting the responses to fail. -- Eemeli, 2018-09-09
  pdfType = 'text/html; charset=UTF-8'
  pngType = 'text/html; charset=UTF-8'
}

describe('Barcodes', () => {
  const key = 'key'
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

    it('get own barcode with id as PNG', () =>
      member
        .get(`/api/barcode/${id}.png`)
        .expect(200)
        .expect('Content-Type', pngType))

    it('get own barcode with id as PDF', () =>
      member
        .get(`/api/barcode/${id}.pdf`)
        .expect(200)
        .expect('Content-Type', pdfType))

    it("fail to get other's barcode", () =>
      member.get(`/api/barcode/${id - 1}.png`).expect(401))

    it('fail to get own barcode with bad key', () =>
      member.get(`/api/barcode/${key + 'x'}/${id}.png`).expect(401))
  })

  describe('anonymous access', () => {
    const anonymous = new Agent()

    it("get member's barcode with key as PNG", () =>
      anonymous
        .get(`/api/barcode/${key}/${id}.png`)
        .expect(200)
        .expect('Content-Type', pngType))

    it("get member's barcode with key as PDF", () =>
      anonymous
        .get(`/api/barcode/${key}/${id}.pdf`)
        .expect(200)
        .expect('Content-Type', pdfType))

    it('fail to get barcode with bad key', () =>
      anonymous.get(`/api/barcode/${key + 'x'}/${id}.png`).expect(401))
  })

  describe('admin access', () => {
    const admin = new Agent()
    before(() => admin.loginAsAdmin().expect(200))

    it("get member's barcode with id as PNG", () =>
      admin
        .get(`/api/barcode/${id}.png`)
        .expect(200)
        .expect('Content-Type', pngType))

    it("get member's barcode with id as PDF", () =>
      admin
        .get(`/api/barcode/${id}.pdf`)
        .expect(200)
        .expect('Content-Type', pdfType))
  })
})
