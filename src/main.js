var express = require('express');
var bodyParser = require("body-parser");

var config = require('./config');
var routes = require('./routes');
var Database = require('./db').Database;



function main(config){
    var app = express();
    app.use(bodyParser.json());

    routes.routeIndex(app);
    routes.routeRessources(app);
    var db = new Database(config);
    routes.routeData(app, db);

    var server = app.listen(config.port, function(){
      console.log('App listening at http://%s:%s', server.address().address, config.port);
    });
}


if (require.main === module) {
    main(config);
}

module.exports = {
    main: main,
}