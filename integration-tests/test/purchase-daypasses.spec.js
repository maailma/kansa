const request = require('supertest')
const fs = require('fs')
const stripe = require('stripe')(
  process.env.STRIPE_SECRET_APIKEY || 'sk_test_zq022Drx7npYPVEtXAVMaOJT'
)

const cert = fs.readFileSync('../nginx/ssl/localhost.cert', 'utf8')
const host = 'https://localhost:4430'
const adminLoginParams = { email: 'admin@example.com', key: 'key' }

describe('Daypass purchases', () => {
  const agent = request.agent(host, { ca: cert })

  context('Parameters', () => {
    it('should require required parameters', done => {
      agent
        .post('/api/purchase/daypass')
        .send({ amount: 0, email: '@', source: { id: 'x' } })
        .expect(res => {
          const exp = {
            status: 400,
            message: 'Required parameters: amount, email, passes, source'
          }
          if (res.status !== exp.status)
            throw new Error(
              `Bad status: got ${res.status}, expected ${exp.status}`
            )
          if (res.body.message !== exp.message)
            throw new Error(`Bad reply: ${JSON.stringify(res.body)}`)
        })
        .end(done)
    })

    it('should require at least one pass with a day', done => {
      agent
        .post('/api/purchase/daypass')
        .send({
          amount: 1,
          email: '@',
          passes: [{ legal_name: 'y', membership: 'Adult' }],
          source: { id: 'x' }
        })
        .expect(res => {
          const exp = {
            status: 400,
            message: 'All passes must include at least one day'
          }
          if (res.status !== exp.status)
            throw new Error(
              `Bad status: got ${res.status}, expected ${exp.status}`
            )
          if (res.body.message !== exp.message)
            throw new Error(`Bad reply: ${JSON.stringify(res.body)}`)
        })
        .end(done)
    })

    it('should require a correct amount', done => {
      agent
        .post('/api/purchase/daypass')
        .send({
          amount: 1,
          email: '@',
          source: { id: 'x' },
          passes: [
            { membership: 'Adult', email: '@', legal_name: 'x', day1: true }
          ]
        })
        .expect(res => {
          const exp = {
            status: 400,
            message: `Amount mismatch: in request 1, calculated 2500`
          }
          if (res.status !== exp.status)
            throw new Error(
              `Bad status: got ${res.status}, expected ${
                exp.status
              }: ${JSON.stringify(res.body)}`
            )
          if (res.body.message !== exp.message)
            throw new Error(`Bad reply: ${JSON.stringify(res.body)}`)
        })
        .end(done)
    })
  })

  context('Prices', function() {
    const agent = request.agent(host, { ca: cert })

    it('should get prices', done => {
      agent
        .get('/api/purchase/daypass-prices')
        .expect(200)
        .expect(({ body }) => {
          if (!body || !body.Adult || !body.Adult.day1)
            throw new Error(`Bad response! ${JSON.stringify(body)}`)
        })
        .end(done)
    })
  })

  context('New daypasses (using Stripe API)', function() {
    this.timeout(10000)
    const agent = request.agent(host, { ca: cert })
    const testName =
      'test-' + (Math.random().toString(36) + '00000000000000000').slice(2, 7)

    it('should add new daypass', done => {
      stripe.tokens
        .create({
          card: {
            number: '4242424242424242',
            exp_month: 12,
            exp_year: 2020,
            cvc: '123'
          }
        })
        .then(source => {
          agent
            .post('/api/purchase/daypass')
            .send({
              amount: 7000,
              email: `${testName}@example.com`,
              source,
              passes: [
                {
                  membership: 'Adult',
                  email: `${testName}@example.com`,
                  legal_name: `a-${testName}`,
                  day1: true,
                  day2: true
                }
              ]
            })
            .expect(res => {
              if (res.status !== 200)
                throw new Error(`Purchase failed! ${JSON.stringify(res.body)}`)
              if (!res.body.charge_id) {
                throw new Error(`Bad response! ${JSON.stringify(res.body)}`)
              }
            })
            .end(done)
        })
    })
  })
})
