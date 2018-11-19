const { card, stripe } = require('./_stripe')

module.exports = Agent => {
  const agent = new Agent()
  let config
  const prices = { adult: 0, supporter: 0, paperPubs: 0 }
  before(done => {
    agent
      .get('/api/shop/data')
      .expect(({ body }) => {
        prices.adult = body.new_member.types.find(t => t.key === 'Adult').amount
        prices.supporter = body.new_member.types.find(
          t => t.key === 'Supporter'
        ).amount
        prices.paperPubs = body.paper_pubs.types[0].amount
      })
      .end(() =>
        agent
          .get('/api/config')
          .expect(({ body }) => {
            config = body
          })
          .end(done)
      )
  })

  context('Parameters', () => {
    it('should require required parameters', done => {
      agent
        .post('/api/shop/buy-membership')
        .send({ amount: 0, email: '@', source: { id: 'x' } })
        .expect(res => {
          const exp = {
            status: 400,
            message: 'If one is set, the other is required: amount, source'
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

    it('should require at least one optional parameter', done => {
      agent
        .post('/api/shop/buy-membership')
        .send({ amount: 1, email: '@', source: { id: 'x' } })
        .expect(res => {
          const exp = {
            status: 400,
            message: 'Non-empty new_members or upgrades is required'
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
        .post('/api/shop/buy-membership')
        .send({
          amount: 1,
          email: '@',
          source: { id: 'x' },
          new_members: [{ membership: 'Adult', email: '@', legal_name: 'x' }]
        })
        .expect(res => {
          const exp = {
            status: 400,
            message: `Amount mismatch: in request 1, calculated ${prices.adult}`
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

  context('New members (using Stripe API)', function() {
    this.timeout(10000)
    const testName =
      'test-' + (Math.random().toString(36) + '00000000000000000').slice(2, 7)

    it('should add new memberships', () =>
      stripe.tokens.create({ card }).then(source =>
        new Agent()
          .post('/api/shop/buy-membership')
          .send({
            amount:
              prices.supporter +
              prices.adult +
              (config.paid_paper_pubs ? prices.paperPubs : 0),
            email: `${testName}@example.com`,
            source,
            new_members: [
              {
                membership: 'Supporter',
                email: `${testName}@example.com`,
                legal_name: `s-${testName}`
              },
              {
                membership: 'Adult',
                email: `${testName}@example.com`,
                legal_name: `a-${testName}`,
                paper_pubs: {
                  name: testName,
                  address: 'address',
                  country: 'land'
                }
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
      ))
  })

  context('Upgrades (using Stripe API)', function() {
    this.timeout(10000)
    const agent = new Agent()
    const testName =
      'test-' + (Math.random().toString(36) + '00000000000000000').slice(2, 7)
    let testId

    before(() => {
      const admin = new Agent()
      return admin
        .loginAsAdmin()
        .expect(200)
        .then(() =>
          admin.post('/api/people').send({
            membership: 'Supporter',
            email: `${testName}@example.com`,
            legal_name: testName
          })
        )
        .then(res => {
          if (res.status !== 200)
            throw new Error(`Member init failed! ${JSON.stringify(res.body)}`)
          testId = res.body.id
        })
    })

    it('should apply an upgrade', () =>
      stripe.tokens.create({ card }).then(source =>
        agent
          .post('/api/shop/buy-membership')
          .send({
            amount: prices.adult - prices.supporter,
            email: `${testName}@example.com`,
            source,
            upgrades: [{ id: testId, membership: 'Adult' }]
          })
          .expect(res => {
            if (res.status !== 200)
              throw new Error(`Upgrade failed! ${JSON.stringify(res.body)}`)
            if (!res.body.charge_id) {
              throw new Error(`Bad response! ${JSON.stringify(res.body)}`)
            }
          })
      ))

    it('should handle paid paper publications upgrade', () =>
      stripe.tokens.create({ card }).then(source =>
        agent
          .post('/api/shop/buy-membership')
          .send({
            amount: prices.paperPubs,
            email: `${testName}@example.com`,
            source,
            upgrades: [
              {
                id: testId,
                paper_pubs: {
                  name: 'name',
                  address: 'multi\n-line\n-address',
                  country: 'land'
                }
              }
            ]
          })
          .expect(res => {
            if (config.paid_paper_pubs) {
              if (res.status !== 200)
                throw new Error(
                  `Paper pubs purchase failed! ${JSON.stringify(res.body)}`
                )
            } else {
              if (res.status < 400)
                throw new Error(
                  `Paper pubs purchase should have failed! ${JSON.stringify(
                    res.body
                  )}`
                )
            }
          })
      ))
  })
}
