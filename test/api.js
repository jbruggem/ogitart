const _ = require("lodash");
const should = require("should");
const supertest = require('supertest');
const appMain = require('../src/main');
const config = require('../src/config');
const path = require('path');
const mkdirp = require('mkdirp');
const rmdir = require('rimraf');


// var someDayData = {"choices":[["JBR","Pain Talon"],["ADE","Pain Burger"],["FDW","Sala Capella"],["EDL","Pain Burger"]]};

const emptyCompletion = { "dishes": [], "names": [] };
const emptyData = { "choices": [] };
const okResult = { result: true };
const choice1 = ["JBR", "Pain Talon"];
const choice2 = ["ADE", "Pain Burger"];
const choice3 = ["ADE", "Pain Pon"];
const data1 = {"choices": [choice1].sort()};
const data2 = {"choices": [choice1, choice2].sort()};
const data3 = {"choices": [choice1, choice3].sort()};

const completion1 = {
    "dishes": [choice1[1]],
    "names": [choice1[0]]
};
const completion2 = {
    "dishes": [choice1[1], choice2[1]],
    "names": [choice1[0], choice2[0]]
};
const completion3 = {
    "dishes": [choice1[1], choice2[1], choice3[1]],
    "names": [choice1[0], choice2[0]]
};

function dataWith(choice) {
    return {"choices": [choice]};
}


describe('The API', function(){
    this.timeout(20000);

    var dataTest = path.join( __dirname, './data-test');
    var dataTestYear = path.join( dataTest, ''+new Date().getFullYear());
    var api;

    function getApi(){ return api; }

    var conf = _.assign(config, {
        port: 8549,
        dataFolder: dataTest,
    });


    /////////////////
    // start testing
    /////////////////

    before(function(done){

        // reset folders
        rmdir.sync(dataTest);
        mkdirp.sync(dataTest);

        // start app
        var app = appMain.prepare(conf);
        api  = supertest(app);

        done();
    });

    describe('GET /data', function(){
        expectSandwichs(getApi, emptyData);
    });

    describe('GET /completion', function(){
        expectCompletion(getApi, emptyCompletion);
    });

    describe('PUSH /data: add first choice', function(){
        addSandwich(getApi, dataWith(choice1));
    });

    describe('GET /data sandwich 1', function(){
        expectSandwichs(getApi, data1);
    });

    describe('GET /completion', function(){
        expectCompletion(getApi,  completion1);
    });

    describe('PUSH /data: add second choice', function(){
        addSandwich(getApi, dataWith(choice2));
    });

    describe('GET /data sandwich 2', function(){
        expectSandwichs(getApi, data2);
    });

    describe('GET /completion', function(){
        expectCompletion(getApi,  completion2);
    });

    describe('PUSH /data: add third choice', function(){
        addSandwich(getApi, dataWith(choice3));
    });

    describe('GET /data sandwich 3', function(){
        expectSandwichs(getApi, data3);
    });

    describe('GET /completion', function(){
        expectCompletion(getApi,  completion3);
    });

});

function expectSandwichs(getApi, expect){
    it('respond with json', function(done){
        getApi()
          .get('/data')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(expect)
          .expect(200, done);
    });
}

function addSandwich(getApi, choice){
    it('respond with json', function(done){
        getApi()
          .post('/data')
          .send(choice)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(okResult)
          .expect(200, done);
    });
}

function expectCompletion(getApi, expect){
    it('respond with json', function(done){
        getApi()
          .get('/completion')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(expect)
          .expect(200, done);
    });
}

