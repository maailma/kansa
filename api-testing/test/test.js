var host = "https://localhost:4430";
var request = require('supertest');
var assert = require('assert');
var fs = require('fs');
var cert = fs.readFileSync('../nginx/ssl/localhost.cert','utf8');

describe("Check that API services are up",function () {
    this.retries(3);
    afterEach(function (done) {
        if (this.currentTest.state === 'failed') {
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
        console.log("hei");
    })
    it("Should respond with json on api/hugo/", function (done) {
        request.agent(host,{ca:cert})
            .get("/api/hugo/")
            .expect("Content-Type",/json/)
        .end(done);
    })
    
})
