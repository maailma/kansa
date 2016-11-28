const request = require('supertest');
const assert = require('assert');
const fs = require('fs');
const stripe = require('stripe')(process.env.STRIPE_SECRET_APIKEY || 'sk_test_zq022Drx7npYPVEtXAVMaOJT');

const cert = fs.readFileSync('../nginx/ssl/localhost.cert', 'utf8');
const prices = require('../../kansa/server/static/prices.json');
const host = 'https://localhost:4430';
const adminLoginParams = { email: 'admin@example.com', key: 'key' };

describe('Purchase', () => {
  const agent = request.agent(host, { ca: cert });

  context('Parameters', () => {
    it('should require required parameters', (done) => {
      agent.post('/api/kansa/purchase')
        .send({ amount: 0, email: '@', token: 'x' })
        .expect((res) => {
          const exp = { status: 400, message: 'Required parameters: amount, email, token' };
          if (res.status !== exp.status) throw new Error(`Bad status: got ${res.status}, expected ${exp.status}`);
          if (res.body.message !== exp.message) throw new Error(`Bad reply: ${JSON.stringify(res.body)}`);
        })
        .end(done);
    });

    it('should require at least one optional parameter', (done) => {
      agent.post('/api/kansa/purchase')
        .send({ amount: 1, email: '@', token: 'x' })
        .expect((res) => {
          const exp = { status: 400, message: 'Non-empty new_members or upgrades is required' };
          if (res.status !== exp.status) throw new Error(`Bad status: got ${res.status}, expected ${exp.status}`);
          if (res.body.message !== exp.message) throw new Error(`Bad reply: ${JSON.stringify(res.body)}`);
        })
        .end(done);
    });

    it('should require a correct amount', (done) => {
      agent.post('/api/kansa/purchase')
        .send({ amount: 1, email: '@', token: 'x', new_members: [{ membership: 'Adult', email: '@', legal_name: 'x' }] })
        .expect((res) => {
          const exp = { status: 400, message: `Amount mismatch: in request 1, calculated ${prices.Adult.amount}` };
          if (res.status !== exp.status) throw new Error(`Bad status: got ${res.status}, expected ${exp.status}: ${JSON.stringify(res.body)}`);
          if (res.body.message !== exp.message) throw new Error(`Bad reply: ${JSON.stringify(res.body)}`);
        })
        .end(done);
    });
  });

  context('New members (using Stripe API)', function() {
    this.timeout(10000);
    const agent = request.agent(host, { ca: cert });
    const testName = 'test-' + (Math.random().toString(36)+'00000000000000000').slice(2, 7);

    it('should get new memberships', (done) => {
      stripe.tokens.create({
        card: {
          number: '4242424242424242',
          exp_month: 12,
          exp_year: 2020,
          cvc: '123'
        }
      }).then(testToken => {
        agent.post('/api/kansa/purchase')
          .send({
            amount: prices.Supporter.amount + prices.Adult.amount + prices.PaperPubs.amount,
            email: 'test@example.com',
            token: testToken.id,
            new_members: [
              { membership: 'Supporter', email: '@', legal_name: `s-${testName}` },
              { membership: 'Adult', email: '@', legal_name: `a-${testName}`,
                paper_pubs: { name: testName, address: 'address', country: 'land'} }
            ]
          })
          .expect((res) => {
            if (res.status !== 200) throw new Error(`Purchase failed! ${JSON.stringify(res.body)}`);
            // HERE
          })
          .end(done);
      });
    });
  });

  context('Upgrades (using Stripe API)', function() {
    this.timeout(10000);
    const admin = request.agent(host, { ca: cert });
    const agent = request.agent(host, { ca: cert });
    const testName = 'test-' + (Math.random().toString(36)+'00000000000000000').slice(2, 7);
    let testId;

    before((done) => {
      admin.get('/api/kansa/login')
        .query(adminLoginParams)
        .end(() => {
          admin.post('/api/kansa/people')
            .send({ membership: 'Supporter', email: 'test@example.com', legal_name: testName })
            .expect((res) => {
              if (res.status !== 200) throw new Error(`Member init failed! ${JSON.stringify(res.body)}`);
              testId = res.body.id;
            })
            .end(done);
        });
    });

    it('should apply an upgrade', (done) => {
      stripe.tokens.create({
        card: {
          number: '4242424242424242',
          exp_month: 12,
          exp_year: 2020,
          cvc: '123'
        }
      }).then(testToken => {
        agent.post('/api/kansa/purchase')
          .send({
            amount: prices.Adult.amount - prices.Supporter.amount,
            email: 'test@example.com',
            token: testToken.id,
            upgrades: [{ id: testId, membership: 'Adult' }]
          })
          .expect((res) => {
            if (res.status !== 200) throw new Error(`Upgrade failed! ${JSON.stringify(res.body)}`);
            // HERE
          })
          .end(done);
      });
    });

  });
});
