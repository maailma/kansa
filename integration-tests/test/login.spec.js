const host = 'https://localhost:4430';
const request = require('supertest');
const assert = require('assert');
const fs = require('fs');

// For now test data is empty.
const memberlist = [];

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

  it('Should respond with json on api/kansa/', (done) => {
    unlogged.get('/api/kansa/')
      .expect('Content-Type', /json/)
      .end(done);
  });

  it('Should respond with json on api/hugo/', (done) => {
    unlogged.get('/api/hugo/')
      .expect('Content-Type',/json/)
      .end(done);
  });
});

describe('Member list', () => {
  it('Returns `success` as status and test data member list.', (done) => {
    unlogged.get('/api/kansa/public/people')
      .expect(200, { status: 'success', data: memberlist })
      .end(done);
    })
});

describe('Country statistics', () => {
  it('Returns country statistics', (done) => {
    unlogged.get('/api/kansa/public/stats')
      .expect((res) => {
        if (
          res.status !== 200 || res.body.status !== 'success' ||
          !res.body.members || !res.body.members[''].hasOwnProperty('total')
        ) {
          throw new Error(`Fail! ${JSON.stringify(res.body)}`);
        }
      })
      .end(done);
  });
});

describe('Login', () => {
  context('Successful login', () => {
    it('gets a session cookie or it gets the hose again.', (done) => {
      admin.get('/api/kansa/login')
        .query(loginparams)
        .expect('set-cookie',/w75/)
        .expect(200, { status:'success', email: loginparams.email })
        .end(done);
    });

    it('gets user information', (done) => {
      admin.get('/api/kansa/user')
        .expect(200)
        .end(done);
    });
  });

  context('Login with wrong email', () => {
    it('gets 401 response', (done) => {
      unlogged.get('/api/kansa/login')
        .query({ email: 'foo@doo.com', key: loginparams.key })
        .expect(401)
        .end(done);
    });

    it('gets unauthorized from /api/kansa/usr', (done) => {
      unlogged.get('/api/kansa/user')
        .expect(401, { status: 'unauthorized' })
        .end(done)
    });
  });

  context('Login with wrong key', () => {
    it('gets 401 response', (done) => {
      unlogged.get('/api/kansa/login')
        .query({ email: loginparams.email, key: 'foo' })
        .expect(401)
        .end(done);
    });

    it('gets unauthorized from /api/kansa/usr', (done) => {
      unlogged.get('/api/kansa/user')
        .expect(401,{status:'unauthorized'})
        .end(done);
    });
  });
});

describe('Logout', () => {
  const testagent = request.agent(host, { ca });

  before((done) => {
    testagent.get('/api/kansa/login')
      .query(loginparams)
      .expect('set-cookie',/w75/)
      .expect(200, { status: 'success', email: loginparams.email })
      .end(done);
  });

  context('Successful logout', () => {
    it('should be successful', (done) => {
      testagent.get('/api/kansa/logout')
        .expect(200, { status: 'success', email: loginparams.email })
        .end(done);
    });

    it('gets unauthorized from /api/kansa/user', (done) => {
      testagent.get('/api/kansa/user')
        .expect(401, { status: 'unauthorized' })
        .end(done);
    });
  });

  context('Not logged in', () => {
    it('logout should be unauthorized', (done) => {
      unlogged.get('/api/kansa/logout')
        .expect(401, { status: 'unauthorized' })
        .end(done);
    });

    it('gets unauthorized from /api/kansa/user', (done) => {
      testagent.get('/api/kansa/user')
        .expect(401, { status: 'unauthorized' })
        .end(done);
    });
  });
});

describe('Key request', () => {
  before((done) => {
    admin.get('/api/kansa/logout')
      .expect(200, { status: 'success', email: loginparams.email })
      .end(done);
  });

  context('Should not reset by default', () => {
    it('should be successful', (done) => {
      admin.post('/api/kansa/key')
        .send({ email: loginparams.email })
        .expect(200, { status: 'success', email: loginparams.email })
        .end(done);
    });

    it('should still be able to login', (done) => {
      admin.get('/api/kansa/login')
        .query(loginparams)
        .expect('set-cookie',/w75/)
        .expect(200, { status: 'success', email: loginparams.email })
        .end(done);
    });
  });
});
