const request = require('supertest');
const fs = require('fs');
const stripe = require('stripe')(process.env.STRIPE_SECRET_APIKEY || 'sk_test_zq022Drx7npYPVEtXAVMaOJT');

const cert = fs.readFileSync('../nginx/ssl/localhost.cert', 'utf8');
const host = 'https://localhost:4430';
const adminLoginParams = { email: 'admin@example.com', key: 'key' };

describe('Other purchases', () => {
  const agent = request.agent(host, { ca: cert });

  context('Parameters', () => {
    it('should require required parameters', (done) => {
      agent.post('/api/purchase/other')
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
      agent.post('/api/purchase/other')
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
      agent.post('/api/purchase/other')
        .send({
          email: 'nonesuch@example.com',
          source: { id: 'x' },
          items: [{ amount: 1, category: 'sponsor', type: 'bench', data: {} }]
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
      agent.post('/api/purchase/other')
        .send({
          email: 'nonesuch@example.com',
          source: { id: 'x' },
          items: [{ amount: 1, category: 'sponsor', type: 'bench', data: { sponsor: 'y' } }]
        })
        .expect((res) => {
          const exp = { status: 400, message: 'Not a known email address: ' };
          if (res.status !== exp.status) throw new Error(`Bad status: got ${res.status}, expected ${exp.status}`);
          if (res.body.message.indexOf(exp.message) !== 0) throw new Error(`Bad reply: ${JSON.stringify(res.body)}`);
        })
        .end(done);
    });

    it('should require person_id to be valid if not null', (done) => {
      agent.post('/api/purchase/other')
        .send({
          email: 'admin@example.com',
          source: { id: 'x' },
          items: [{ amount: 1, person_id: -1, category: 'sponsor', type: 'bench', data: { sponsor: 'y' } }]
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
      agent.get('/api/purchase/data')
        .expect(200)
        .expect(({ body }) => {
          const { shape, types } = body && body.new_member || {}
          if (
            !shape || shape.every(({ key }) => key !== 'email') ||
            !types || types.every(({ key }) => key !== 'Adult')
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
      admin.get('/api/login')
        .query(adminLoginParams)
        .end(() => {
          admin.post('/api/people')
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
        agent.post('/api/purchase/other')
          .send({
            email: `${testName}@example.com`,
            source,
            items: [{
              amount: 4200,
              category: 'sponsor',
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
      admin.get('/api/purchase/list')
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

  context('Invoices (using Stripe API)', function() {
    this.timeout(10000)
    const admin = request.agent(host, { ca: cert })
    const { email } = adminLoginParams
    const testData = { sponsor: 'test-' + (Math.random().toString(36)+'00000000000000000').slice(2, 7) }
    let item

    before((done) => {
      admin.get('/api/login')
        .query(adminLoginParams)
        .end(done);
    });

    it('invoice should be created', (done) => {
      admin.post('/api/purchase/invoice')
        .send({
          email,
          items: [{
            amount: 4200,
            category: 'sponsor',
            type: 'bench',
            data: testData
          }]
        })
        .expect(200)
        .expect(({ body }) => {
          if (!body || body.status !== 'success' || !body.email) throw new Error(
            `Bad response! ${JSON.stringify(body)}`
          );
        })
        .end(done);
    });

    it('invoice should be listed', (done) => {
      admin.get('/api/purchase/list')
        .expect(200)
        .expect(({ body }) => {
          if (!Array.isArray(body)) throw new Error(`Not array! ${JSON.stringify(body)}`);
          item = body.find(it => it.data && it.data.sponsor === testData.sponsor)
          if (!item) throw new Error(`Missing item! ${JSON.stringify(body)}`);
        })
        .end(done);
    });

    it('invoice should be payable', (done) => {
      stripe.tokens.create({
        card: {
          number: '4242424242424242',
          exp_month: 12,
          exp_year: 2020,
          cvc: '123'
        }
      }).then(source => {
        agent.post('/api/purchase/other')
          .send({
            email,
            source,
            items: [{ id: item.id }]
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

  });

});
