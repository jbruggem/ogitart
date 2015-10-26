var _ = require("lodash");
var should = require("should");
var supertest = require('supertest');
var appMain = require('../src/main');
var config = require('../src/config');
var path = require('path');
var mkdirp = require('mkdirp');
var rmdir = require('rimraf');


// var someDayData = {"choices":[["JBR","Pain Talon"],["ADE","Pain Burger"],["FDW","Sala Capella"],["EDL","Pain Burger"]]};

var emptyCompletion = { "dishes": [], "names": [] };
var emptyData = { "choices": [] };
var okResult = { result: true };
var addChoice1 = {"choices":[["JBR","Pain Talon"]]};
var addCompletion1 = {"dishes":["Pain Talon"]};
var addChoice2 = {"choices":[["ADE","Pain Burger"]]};
var addCompletion2 = {"dishes":["Pain Burger"]};


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
        addSandwich(getApi, addChoice1);
    });

    describe('GET /data sandwich 1', function(){
        expectSandwichs(getApi, mergeChoices(addChoice1));
    });

    describe('GET /completion', function(){
        expectCompletion(getApi,  mergeCompletion(addCompletion1));
    });

    describe('PUSH /data: add second choice', function(){
        addSandwich(getApi, addChoice2);
    });

    describe('GET /data sandwich 2', function(){
        expectSandwichs(getApi, mergeChoices(addChoice1, addChoice2));
    });

        describe('GET /completion', function(){
            expectCompletion(getApi,  mergeCompletion(addCompletion1, addCompletion2));
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

function mergeChoices(){
    var init = _.clone(emptyData);
    _.forEach(arguments, function(data){
        if(data.choices)
            init.choices = init.choices.concat(data.choices);
    });
    init.choices.sort();
    return init;
}

function mergeCompletion(){
    var init = _.clone(emptyCompletion);
    _.forEach(arguments, function(data){
        if(data.dishes)
            init.dishes = init.dishes.concat(data.dishes);
        if(data.names)
            init.names = init.names.concat(data.names);
    });
    return init;
}
