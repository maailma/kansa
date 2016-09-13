var host = "https://localhost:4430";
var request = require('supertest');
var fs = require('fs');
var cert = fs.readFileSync('../nginx/ssl/localhost.cert','utf8');

describe("Check that API services are up",function () {
    this.retries(3); /* Then shalt thou count to three, no more, no less. Three shall be
        the number thou shalt count, and the number of the counting shall
        be three. Four shalt thou not count, neither count thou two,
        excepting that thou then proceed to three. Five is right out. */
    afterEach(function (done) { // wait for one second after failed test before retry.
        if (this.currentTest.state === 'failed') {
            setTimeout(function (done) {
                done();
            },1000);
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