const host = 'https://localhost:4430';
const request = require('supertest');
const assert = require('assert');
const fs = require('fs');

// Create agent for unlogged and admin sessions
const ca = fs.readFileSync('../nginx/ssl/localhost.cert','utf8');
const unlogged = request.agent(host, { ca });
const admin = request.agent(host, { ca });
const loginparams = { email: 'admin@example.com', key: 'key' };

describe('Check that API services are up', function() {
  this.timeout(120000)
  this.retries(10);

  afterEach(function(done) {
    if (this.currentTest.state !== 'passed') {
      setTimeout(done, 2000);
    } else {
      done();
    }
  });

  it('Should respond with json on api/', (done) => {
    unlogged.get('/api/')
      .expect('Content-Type', /json/)
      .end(done);
  });

  it('Should respond with json on api/hugo/', (done) => {
    unlogged.get('/api/hugo/')
      .expect('Content-Type',/json/)
      .end(done);
  });
});

describe('Public data', () => {
  it('Member list is an array', (done) => {
    unlogged.get('/api/public/people')
      .expect((res) => {
        if (res.status !== 200 || !Array.isArray(res.body)) {
          throw new Error(`Fail! ${JSON.stringify(res.body)}`)
        }
      })
      .end(done)
  })

  it('Country statistics includes totals', (done) => {
    unlogged.get('/api/public/stats')
      .expect((res) => {
        if (res.status !== 200 || !res.body || !res.body['='].hasOwnProperty('=')) {
          throw new Error(`Fail! ${JSON.stringify(res.body)}`)
        }
      })
      .end(done)
  })

  it('Configuration is an object with id, name', (done) => {
    unlogged.get('/api/config')
      .expect((res) => {
        if (res.status !== 200 || !res.body || !res.body.id || !res.body.name) {
          throw new Error(`Fail! ${JSON.stringify(res.body)}`)
        }
      })
      .end(done)
  })
})

describe('Login', () => {
  context('Successful login', () => {
    it('gets a session cookie or it gets the hose again.', (done) => {
      admin.get('/api/login')
        .query(loginparams)
        .expect('set-cookie',/w75/)
        .expect(200, { status:'success', email: loginparams.email })
        .end(done);
    });

    it('gets user information', (done) => {
      admin.get('/api/user')
        .expect(200)
        .end(done);
    });
  });

  context('Login with wrong email', () => {
    it('gets 401 response', (done) => {
      unlogged.get('/api/login')
        .query({ email: 'foo@doo.com', key: loginparams.key })
        .expect(401)
        .end(done);
    });

    it('gets unauthorized from /api/user', (done) => {
      unlogged.get('/api/user')
        .expect(401, { status: 'unauthorized' })
        .end(done)
    });
  });

  context('Login with wrong key', () => {
    it('gets 401 response', (done) => {
      unlogged.get('/api/login')
        .query({ email: loginparams.email, key: 'foo' })
        .expect(401)
        .end(done);
    });

    it('gets unauthorized from /api/user', (done) => {
      unlogged.get('/api/user')
        .expect(401, { status: 'unauthorized' })
        .end(done);
    });
  });

  context('Login with expired key', () => {
    it('gets 403 response', (done) => {
      const email = 'expired@example.com'
      unlogged.get('/api/login')
        .query({ email, key: 'key' })
        .expect(403, { email, status: 'expired' })
        .end(done)
    });

    it('gets unauthorized from /api/user', (done) => {
      unlogged.get('/api/user')
        .expect(401, { status: 'unauthorized' })
        .end(done)
    });
  });
});

describe('Logout', () => {
  const testagent = request.agent(host, { ca });

  before((done) => {
    testagent.get('/api/login')
      .query(loginparams)
      .expect('set-cookie',/w75/)
      .expect(200, { status: 'success', email: loginparams.email })
      .end(done);
  });

  context('Successful logout', () => {
    it('should be successful', (done) => {
      testagent.get('/api/logout')
        .expect(200, { status: 'success', email: loginparams.email })
        .end(done);
    });

    it('gets unauthorized from /api/user', (done) => {
      testagent.get('/api/user')
        .expect(401, { status: 'unauthorized' })
        .end(done);
    });
  });

  context('Not logged in', () => {
    it('logout should be unauthorized', (done) => {
      unlogged.get('/api/logout')
        .expect(401, { status: 'unauthorized' })
        .end(done);
    });

    it('gets unauthorized from /api/user', (done) => {
      testagent.get('/api/user')
        .expect(401, { status: 'unauthorized' })
        .end(done);
    });
  });
});

describe('Key request', () => {
  before((done) => {
    admin.get('/api/logout')
      .expect(200, { status: 'success', email: loginparams.email })
      .end(done);
  });

  context('Should not reset by default', () => {
    it('should be successful', (done) => {
      admin.post('/api/key')
        .send({ email: loginparams.email })
        .expect(200, { status: 'success', email: loginparams.email })
        .end(done);
    });

    it('should still be able to login', (done) => {
      admin.get('/api/login')
        .query(loginparams)
        .expect('set-cookie',/w75/)
        .expect(200, { status: 'success', email: loginparams.email })
        .end(done);
    });
  });

  context('Account creation', () => {
    const agent = request.agent(host, { ca });
    const testName = 'test-' + (Math.random().toString(36)+'00000000000000000').slice(2, 7);
    const testEmail = testName + '@example.com';

    it('Should create non-member accounts', (done) => {
      agent.post('/api/key')
        .send({ email: testEmail, name: testName })
        .expect(200, { status: 'success', email: testEmail })
        .end(done);
    });
  });
});
