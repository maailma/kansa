const request = require('supertest');
const assert = require('assert');
const fs = require('fs');

const cert = fs.readFileSync('../nginx/ssl/localhost.cert', 'utf8');
const prices = require('../../kansa/server/static/prices.json');
const host = 'https://localhost:4430';

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
});
