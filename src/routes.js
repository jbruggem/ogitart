var _ = require('lodash');
var path = require('path');
var utils = require('./utils');

var INDEX = path.join(__dirname, '..', 'public/index.html');

// set resources as absolute paths
var RESOURCES = _.map([
    './node_modules/bootstrap/dist/css/bootstrap.min.css',
    './node_modules/bootstrap/dist/css/bootstrap-theme.min.css',
    './build/lodash.min.js',
    './node_modules/bootstrap/dist/js/bootstrap.min.js',
    './node_modules/jquery/dist/jquery.min.js',
    './node_modules/typeahead.js/dist/typeahead.jquery.min.js',
    './public/client.js',
], _.compose(_.partial(path.join, __dirname, '../'), _.identity)); 



//////////////////
// Routes
//////////////////


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

function routeData(app, db){
    var completion = {}; 

    function updateCompletion(){
        db.getUniqueValuesFromScratch(function(data){
            completion = data;
        });
    }

    // do it at start up.
    updateCompletion();

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

            completion.names = _.union(completion.names, utils.nth(choices, 0));
            completion.dishes = _.union(completion.dishes, utils.nth(choices, 1));

            var newData = {};
            newData.choices = _.union(oldData.choices, choices);
            newData.choices = _.uniq(newData.choices, function(w){ return utils.comparer(w[0]); });

            console.log("current todayData", newData);

            db.setTodaysData(newData, function(err){
                if(err) return error(res, err);
                res.json({ result: true }); 
                updateCompletion();
            });
        });
    });
}


//////////////////
// Utils
//////////////////


function error(res, err){
    res.status(500).end();
    console.error("Request failed: "+err+".");
}


function sendFileError(res){ return function(err){
    if (err) {
      console.log(err);
      res.status(err.status).end();
    }
};}


//////////////////
// Export
//////////////////

module.exports = {
    routeData: routeData,
    routeIndex: routeIndex,
    routeRessources: routeRessources,
};