var express = require('express');
var bodyParser = require("body-parser");

var config = require('./config');
var routes = require('./routes');
var db = new require('./db').Database(config);



function main(port){
    var app = express();
    app.use(bodyParser.json());

    routes.routeIndex(app);
    routes.routeRessources(app);
    routes.routeData(app, db);

    var server = app.listen(port, function(){
      console.log('App listening at http://%s:%s', server.address().address, port);
    });
}



main(config.port);
