const request = require('supertest');
const assert = require('assert');
const fs = require('fs');
const stripe = require('stripe')(process.env.STRIPE_SECRET_APIKEY || 'sk_test_zq022Drx7npYPVEtXAVMaOJT');

const cert = fs.readFileSync('../nginx/ssl/localhost.cert', 'utf8');
const prices = require('../../kansa/static/prices.json');
const host = 'https://localhost:4430';
const adminLoginParams = { email: 'admin@example.com', key: 'key' };

describe('Membership purchases', () => {
  const agent = request.agent(host, { ca: cert });

  context('Parameters', () => {
    it('should require required parameters', (done) => {
      agent.post('/api/kansa/purchase')
        .send({ amount: 0, email: '@', source: { id: 'x' } })
        .expect((res) => {
          const exp = { status: 400, message: 'Required parameters: amount, email, source' };
          if (res.status !== exp.status) throw new Error(`Bad status: got ${res.status}, expected ${exp.status}`);
          if (res.body.message !== exp.message) throw new Error(`Bad reply: ${JSON.stringify(res.body)}`);
        })
        .end(done);
    });

    it('should require at least one optional parameter', (done) => {
      agent.post('/api/kansa/purchase')
        .send({ amount: 1, email: '@', source: { id: 'x' } })
        .expect((res) => {
          const exp = { status: 400, message: 'Non-empty new_members or upgrades is required' };
          if (res.status !== exp.status) throw new Error(`Bad status: got ${res.status}, expected ${exp.status}`);
          if (res.body.message !== exp.message) throw new Error(`Bad reply: ${JSON.stringify(res.body)}`);
        })
        .end(done);
    });

    it('should require a correct amount', (done) => {
      agent.post('/api/kansa/purchase')
        .send({ amount: 1, email: '@', source: { id: 'x' }, new_members: [{ membership: 'Adult', email: '@', legal_name: 'x' }] })
        .expect((res) => {
          const exp = { status: 400, message: `Amount mismatch: in request 1, calculated ${prices.memberships.Adult.amount}` };
          if (res.status !== exp.status) throw new Error(`Bad status: got ${res.status}, expected ${exp.status}: ${JSON.stringify(res.body)}`);
          if (res.body.message !== exp.message) throw new Error(`Bad reply: ${JSON.stringify(res.body)}`);
        })
        .end(done);
    });
  });

  context('Prices', function() {
    const agent = request.agent(host, { ca: cert });

    it('should get prices', (done) => {
      agent.get('/api/kansa/purchase/prices')
        .expect(200)
        .expect(({ body }) => {
          if (
            !body || !body.memberships || !body.memberships.Adult ||
            !body.memberships.Adult.amount || !body.memberships.Supporter
          ) throw new Error(
            `Bad response! ${JSON.stringify(body)}`
          );
        })
        .end(done);
    });
  });

  context('New members (using Stripe API)', function() {
    this.timeout(10000);
    const agent = request.agent(host, { ca: cert });
    const testName = 'test-' + (Math.random().toString(36)+'00000000000000000').slice(2, 7);

    it('should add new memberships', (done) => {
      stripe.tokens.create({
        card: {
          number: '4242424242424242',
          exp_month: 12,
          exp_year: 2020,
          cvc: '123'
        }
      }).then(source => {
        agent.post('/api/kansa/purchase')
          .send({
            amount: prices.memberships.Supporter.amount + prices.memberships.Adult.amount + prices.PaperPubs.amount,
            email: `${testName}@example.com`,
            source,
            new_members: [
              { membership: 'Supporter', email: `${testName}@example.com`, legal_name: `s-${testName}` },
              { membership: 'Adult', email: `${testName}@example.com`, legal_name: `a-${testName}`,
                paper_pubs: { name: testName, address: 'address', country: 'land'} }
            ]
          })
          .expect((res) => {
            if (res.status !== 200) throw new Error(`Purchase failed! ${JSON.stringify(res.body)}`);
            if (!res.body.charge_id) {
              throw new Error(`Bad response! ${JSON.stringify(res.body)}`)
            }
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
            .send({ membership: 'Supporter', email: `${testName}@example.com`, legal_name: testName })
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
      }).then(source => {
        agent.post('/api/kansa/purchase')
          .send({
            amount: prices.memberships.Adult.amount - prices.memberships.Supporter.amount,
            email: `${testName}@example.com`,
            source,
            upgrades: [{ id: testId, membership: 'Adult' }]
          })
          .expect((res) => {
            if (res.status !== 200) throw new Error(`Upgrade failed! ${JSON.stringify(res.body)}`);
            if (!res.body.charge_id) {
              throw new Error(`Bad response! ${JSON.stringify(res.body)}`)
            }
          })
          .end(done);
      });
    });

    it('should add paper publications', (done) => {
      stripe.tokens.create({
        card: {
          number: '4242424242424242',
          exp_month: 12,
          exp_year: 2020,
          cvc: '123'
        }
      }).then(source => {
        agent.post('/api/kansa/purchase')
          .send({
            amount: prices.PaperPubs.amount,
            email: `${testName}@example.com`,
            source,
            upgrades: [{ id: testId, paper_pubs: { name: 'name', address: 'multi\n-line\n-address', country: 'land'} }]
          })
          .expect((res) => {
            if (res.status !== 200) throw new Error(`Paper pubs purchase failed! ${JSON.stringify(res.body)}`);
            // HERE
          })
          .end(done);
      });
    });

  });
});


describe('Other purchases', () => {
  const agent = request.agent(host, { ca: cert });

  context('Parameters', () => {
    it('should require required parameters', (done) => {
      agent.post('/api/kansa/purchase/other')
        .send({
          email: 'nonesuch@example.com',
          source: { id: 'x' },
          items: [{ amount: 0, category: 'x', type: 'y' }]
        })
        .expect((res) => {
          const exp = { status: 400, message: 'Required parameters: ' };
          if (res.status !== exp.status) throw new Error(`Bad status: got ${res.status}, expected ${exp.status}`);
          if (res.body.message.indexOf(exp.message) !== 0) throw new Error(`Bad reply: ${JSON.stringify(res.body)}`);
        })
        .end(done);
    });

    it('should require a valid category', (done) => {
      agent.post('/api/kansa/purchase/other')
        .send({
          email: 'nonesuch@example.com',
          source: { id: 'x' },
          items: [{ amount: 1, category: 'x', type: 'y' }]
        })
        .expect((res) => {
          const exp = { status: 400, message: 'Supported categories: ' };
          if (res.status !== exp.status) throw new Error(`Bad status: got ${res.status}, expected ${exp.status}`);
          if (res.body.message.indexOf(exp.message) !== 0) throw new Error(`Bad reply: ${JSON.stringify(res.body)}`);
        })
        .end(done);
    });

    it('should require custom data', (done) => {
      agent.post('/api/kansa/purchase/other')
        .send({
          email: 'nonesuch@example.com',
          source: { id: 'x' },
          items: [{ amount: 1, category: 'Sponsorship', type: 'bench', data: {} }]
        })
        .expect((res) => {
          const exp = { status: 400, message: 'Bad data: ' };
          if (res.status !== exp.status) throw new Error(`Bad status: got ${res.status}, expected ${exp.status}`);
          if (res.body.message.indexOf(exp.message) !== 0) throw new Error(`Bad reply: ${JSON.stringify(res.body)}`);
          const { missing, badType } = JSON.parse(res.body.message.substr(exp.message.length));
          if (missing.length !== 1 || badType.length !== 0 || missing[0] !== 'sponsor') {
            throw new Error(`Bad reply: ${JSON.stringify(res.body)}`);
          }
        })
        .end(done);
    });

    it('should require a known email address', (done) => {
      agent.post('/api/kansa/purchase/other')
        .send({
          email: 'nonesuch@example.com',
          source: { id: 'x' },
          items: [{ amount: 1, category: 'Sponsorship', type: 'bench', data: { sponsor: 'y' } }]
        })
        .expect((res) => {
          const exp = { status: 400, message: 'Not a known email address: ' };
          if (res.status !== exp.status) throw new Error(`Bad status: got ${res.status}, expected ${exp.status}`);
          if (res.body.message.indexOf(exp.message) !== 0) throw new Error(`Bad reply: ${JSON.stringify(res.body)}`);
        })
        .end(done);
    });

    it('should require person_id to be valid if not null', (done) => {
      agent.post('/api/kansa/purchase/other')
        .send({
          email: 'admin@example.com',
          source: { id: 'x' },
          items: [{ amount: 1, person_id: -1, category: 'Sponsorship', type: 'bench', data: { sponsor: 'y' } }]
        })
        .expect((res) => {
          const exp = { status: 400, message: 'Not a valid person id: ' };
          if (res.status !== exp.status) throw new Error(`Bad status: got ${res.status}, expected ${exp.status}`);
          if (res.body.message.indexOf(exp.message) !== 0) throw new Error(`Bad reply: ${JSON.stringify(res.body)}`);
        })
        .end(done);
    });
  });

  context('Purchase data', function() {
    const agent = request.agent(host, { ca: cert });

    it('should get data', (done) => {
      agent.get('/api/kansa/purchase/data')
        .expect(200)
        .expect(({ body }) => {
          if (
            !body || !body.Sponsorship || !body.Sponsorship.types ||
            body.Sponsorship.types[0].key !== 'bench'
          ) throw new Error(
            `Bad response! ${JSON.stringify(body)}`
          );
        })
        .end(done);
    });
  });

  context('Sponsorships (using Stripe API)', function() {
    this.timeout(10000);
    const admin = request.agent(host, { ca: cert });
    const agent = request.agent(host, { ca: cert });
    const testName = 'test-' + (Math.random().toString(36)+'00000000000000000').slice(2, 7);

    before((done) => {
      admin.get('/api/kansa/login')
        .query(adminLoginParams)
        .end(() => {
          admin.post('/api/kansa/people')
            .send({ membership: 'Supporter', email: `${testName}@example.com`, legal_name: testName })
            .expect((res) => {
              if (res.status !== 200) throw new Error(`Member init failed! ${JSON.stringify(res.body)}`);
              testId = res.body.id;
            })
            .end(done);
        });
    });

    it('purchase should succeed', (done) => {
      stripe.tokens.create({
        card: {
          number: '4242424242424242',
          exp_month: 12,
          exp_year: 2020,
          cvc: '123'
        }
      }).then(source => {
        agent.post('/api/kansa/purchase/other')
          .send({
            email: `${testName}@example.com`,
            source,
            items: [{
              amount: 4200,
              category: 'Sponsorship',
              type: 'bench',
              data: { sponsor: testName }
            }]
          })
          .expect(200)
          .expect(({ body }) => {
            if (!body || body.status !== 'succeeded' || !body.charge_id) throw new Error(
              `Bad response! ${JSON.stringify(body)}`
            );
          })
          .end(done);
      });
    });

    it('should be listed', (done) => {
      admin.get('/api/kansa/purchase/list')
        .query({ email: `${testName}@example.com` })
        .expect((res) => {
          if (res.status !== 200) throw new Error(`Listing purchases failed! ${JSON.stringify(res.body)}`);
          const purchase = res.body.find(p => p.data.sponsor === testName);
          if (!purchase) throw new Error(`Purchase for "${testName}" not in results! ${JSON.stringify(res.body)}`);
          if (!purchase.updated || !purchase.stripe_charge_id || purchase.status !== 'succeeded') {
            throw new Error(`Purchase not completed! ${JSON.stringify(purchase)}`);
          }
        })
        .end(done);
    });
  });

});
