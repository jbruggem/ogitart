var express = require('express');
var bodyParser = require("body-parser");
var path = require('path');
var Store = require('jfs');
var _ = require('lodash');

var config = require('./config')

var INDEX = path.join(__dirname, 'public/index.html');

// set resources as absolute paths
var RESOURCES = _.map([
    './node_modules/bootstrap/dist/css/bootstrap.min.css',
    './node_modules/bootstrap/dist/css/bootstrap-theme.min.css',
    './node_modules/lodash/dist/lodash.min.js',
    './node_modules/bootstrap/dist/js/bootstrap.min.js',
    './node_modules/jquery/dist/jquery.min.js',
    './node_modules/typeahead.js/dist/typeahead.jquery.min.js',
    './public/client.js',
], _.compose(_.partial(path.join, __dirname), _.identity)); 

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
    var f = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
    return f;
}

function nth(list, index){
    return _.map(list, function(e){ return e[index]; });
}

var db = new (function Database(){
    var dbId = null;
    var store = null;

    function calculateDbId(){ return new Date().getFullYear(); }
    
    function getStore(){
        var newDbId = calculateDbId();
        if(null === store || dbId !== newDbId){
            dbId = newDbId;
            store = new Store(path.join(config.dataFolder, ""+dbId));
        }
        return store;
    }

    return {
        getUniqueValuesFromScratch: function(cb){
            var names = [];
            var dishes = [];
            getStore().all(function(err, days){
                _(days).keys().forEach(function(day){
                    names = _.union(names, nth(days[day].choices, 0));
                    dishes = _.union(dishes, nth(days[day].choices, 1));
                });

                cb({ names: names, dishes: dishes });
            });

        },

        getTodaysData: function(cb){
            var today = currentDataFile();
            getStore().all(function(err, days){
                if( !_.has(days, today) ){
                    days[today] = { choices: [] };
                }
                cb(err, days[today]);
            });
        },

        setTodaysData: function(data, cb){
            var today = currentDataFile();
            store.save(today, data, cb);
        }
    };
})();

function error(res, err){
    res.status(500).end();
    console.error("Request failed: "+err+".");
}

function routeData(app){
    var completion = {}; 

    db.getUniqueValuesFromScratch(function(data){
        completion = data;
    });

    app.get('/completion', function (req, res){
        res.json(completion);
    });

    app.get('/data', function (req, res){
        db.getTodaysData(function(err, data){
            if(err) return error(res, err);

            res.json(data); 
        });
    });

    app.post('/status', function (req, res){
        db.getTodaysData(function(err, data){
            if(err) return error(res, err);

            var closed = req.body.closed;

            if(closed) console.log("Closing for today...");
            else console.log("Opening for today...");

            data.closed = closed;

            db.setTodaysData(data, function(err){
                if(err) return error(res, err);
                res.json({ result: true }); 
            });
        });
    });

    app.post('/data', function (req, res){ 
        db.getTodaysData(function(err, oldData){
            if(err) return error(res, err);
            var choices = req.body.choices;
            console.log("Received:", choices);

            if(oldData.closed){
                console.log("Not saving. Closed for today.");
                return res.json({ result: false, msg: 'Closed for today.'});
            }

            completion.names = _.union( completion.names,  nth(choices, 0) );
            completion.dishes = _.union( completion.dishes,  nth(choices, 1) );

            var newData = {};
            newData.choices = _.union(oldData.choices, choices);
            newData.choices = _.uniq(newData.choices, function(w){ return w[0]; });

            console.log("current todayData", newData);

            db.setTodaysData(newData, function(err){
                if(err) return error(res, err);
                res.json({ result: true }); 
            });
        });
    });
}


main(config.port);
