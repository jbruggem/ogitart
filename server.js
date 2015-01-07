var express = require('express');
var bodyParser = require("body-parser");
var path = require('path');
var Store = require('jfs');
var _ = require('lodash');

var dataStore;

var PORT = 8547;

var DATA_FOLDER = path.join(__dirname, './data');

var INDEX = path.join(__dirname, 'public/index.html');

// set resources as absolute paths
var RESOURCES = _.map([
    './node_modules/bootstrap/dist/css/bootstrap.min.css',
    './node_modules/bootstrap/dist/css/bootstrap-theme.min.css',
    './node_modules/lodash/dist/lodash.min.js',
    './node_modules/bootstrap/dist/js/bootstrap.min.js',
    './node_modules/jquery/dist/jquery.min.js',
    './public/client.js',
], _.compose(_.partial(path.join, __dirname), _.identity)); 


var INIT_DATA_FILE = {
    sandwiches: []
};




function main(port){
    var app = express();
    app.use(bodyParser.json());

    routeIndex(app);
    routeRessources(app);
    routeData(app);

    var server = app.listen(port, function(){
      console.log('App listening at http://%s:%s', server.address().address, port);
    });
}

function sendFileError(res){ return function(err){
    if (err) {
      console.log(err);
      res.status(err.status).end();
    }
};}

function routeIndex(app){
    app.get('/', function (req, res) {
      res.sendFile( INDEX, {}, sendFileError(res));
    });
}

function routeRessources(app){
    _.forEach(RESOURCES, function(ressourcePath){
        app.get('/'+path.basename(ressourcePath), function (req, res) {
          res.sendFile(ressourcePath, {}, sendFileError(res));
        });
    });  
}

function currentDataFile(){
    var d = new Date();
    var f = d.getFullYear() + "/" + d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() 
            + '.json';
    return path.join(DATA_FOLDER, f);
}

function getCurrentDb(){
    var dbPath = currentDataFile();
    return new Store(dbPath);
}

var sandwichDbKey = 'sandwiches';

function setWichs(store, data, cb){
    store.save(sandwichDbKey, data, cb);
}

function getWichs(store, cb){
    store.all(function(err, data){
        if(!err && !data[sandwichDbKey]) data[sandwichDbKey] = [];
        cb(err, data[sandwichDbKey]);
    });
}

function error(res, err){
    res.status(500).end();
    console.error("Request failed: "+err+".");
}



function routeData(app){
    var sandwichRestKey = 'sandwiches';

    app.get('/data', function (req, res) {
        getWichs(getCurrentDb(), function(err, wichs){
            if(err) return error(res, err);

            var obj = {};
            obj[sandwichRestKey] = wichs;
            res.json(obj); 
        });
    });

    app.post('/data', function (req, res) { 
        getWichs(getCurrentDb(), function(err, oldWichs){
            if(err) return error(res, err);

            console.log("Received:", req.body[sandwichRestKey]);
            var newWichs = _.union(oldWichs, req.body[sandwichRestKey]);
            newWichs = _.uniq(newWichs, function(w){ return w[0]; });

            console.log("current collection", newWichs);

            setWichs(getCurrentDb(), newWichs, function(err, data){
                if(err) return error(res, err);
                res.json({ result: true }); 
            });
        });
    });
}


main(PORT);
