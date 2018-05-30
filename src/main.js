var express = require('express');
var bodyParser = require("body-parser");
var cors = require('cors');
var routes = require('./routes');
var Database = require('./db').Database;

function config(arg){
  return arg ? arg : require('./config');
}

function prepareAndRun(arg){
  var conf = config(arg);
  var app = prepare(conf);
  run(app, conf);
}

function prepare(conf){
  var app = express();
  app.use(bodyParser.json());
  if(conf.cors === true){
    app.use(cors());
  }

  routes.routeIndex(app);
  routes.routeRessources(app);
  var db = new Database(conf);
  routes.routeData(app, db);
  return app;
}

function run(app, conf){
  console.log('env: ' + process.env.NODE_ENV);
  var server = app.listen(conf.port, function(){
    console.log('App listening at http://%s:%s', server.address().address, conf.port);
  });

  return server;
}

module.exports = {
  prepare: prepare,
  run: run,
  prepareAndRun: prepareAndRun,
  config: config,
};
