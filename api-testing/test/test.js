var host = "https://localhost:4430";
var request = require('supertest');
var assert = require('assert');
var fs = require('fs');
var cert = fs.readFileSync('../nginx/ssl/localhost.cert','utf8');

describe("Check that API services are up",function () {
    this.retries(5);
    afterEach(function (done) {
        if (this.currentTest.state !== 'passed') {
            setTimeout(done,1000);        
        } else {
            done();
        }
    })
    it("Should have web server running",function (done) {
        request.agent(host,{ca:cert})
            .get('/')
            .expect("Content-Type",/html/)
            .expect(200)
        .end(done);
    });
    it("Should respond with json on api/kansa/", function (done) {
        request.agent(host,{ca:cert})
            .get("/api/kansa/")
            .expect("Content-Type",/json/)
        .end(done);
    })
    it("Should respond with json on api/hugo/", function (done) {
        request.agent(host,{ca:cert})
            .get("/api/hugo/")
            .expect("Content-Type",/json/)
        .end(done);
    })
})

describe("GET /api/kansa/public/people",function () {
    context("With empty database", function () {
        it ("Returns empty JSON list", function (done) {
            request.agent(host,{ca:cert})
            .get("/api/kansa/public/people")
            .expect(200,{status: 'success', data: []})
            .end(done);
        })
    })
})
