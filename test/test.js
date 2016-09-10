var host = "https://localhost:4430";
var request = require('supertest');
var fs = require('fs');
var cert = fs.readFileSync('nginx/ssl/localhost.cert','utf8');

describe("Check API points",function () {
    it("Check that web server is up",function (done) {
        request.agent(host,{ca:cert})
            .get('/')
            .expect("Content-Type",/html/)
            .expect(200)
        .end(done);
    });
    it("Check that api/kansa/ is routed", function (done) {
        request.agent(host,{ca:cert})
            .get("/api/kansa/")
            .expect(function (res) {
                console.log(res);
            })
            .expect("Content-Type",/json/)
            .expect(401)
        .end(done);
    })
    it("Check that api/hugo/ is routed", function (done) {
        request.agent(host,{ca:cert})
            .get("/api/hugo/")
            .expect("Content-Type",/json/)
            .expect(404)
        .end(done);
    })
    
})