var Store = require('jfs');
var utils = require('./utils');
var path = require('path');
var _ = require('lodash');
var mkdirp = require('mkdirp');

module.exports = {
    Database: function Database(config){
        var choicesDbId = null;
        var choicesStore = null;
        var completionStore = null;


        function calculateDbId(){ return new Date().getFullYear(); }

        function getChoicesStore(){
            var newDbId = calculateDbId();
            if(null === choicesStore || choicesDbId !== newDbId){
                choicesDbId = newDbId;
                var dbDir = path.join(config.dataFolder, ''+choicesDbId);
                mkdirp.sync(dbDir);

                choicesStore = new Store(dbDir);
            }
            return choicesStore;
        }

        function getCompletionStore(){
            if( null === completionStore ){
                var dbDir = path.join(config.dataFolder, 'completions');
                mkdirp.sync(dbDir);
                completionStore = new Store(dbDir);
            }
            return completionStore;
        }


        function getNamesAndDishesFromChoicesStore(cb){
            var names = [];
            var dishes = [];
            getChoicesStore().all(function(err, days){
                if(err) console.error(err);
                _(days).keys().forEach(function(day){
                    names = _.union(names, utils.getNormalizedUserNames(days[day].choices));
                    dishes =  _.union(dishes, utils.getNormalizedDishNames(days[day].choices));
                }).value();
                cb({ names: names, dishes: dishes });
            });

        }

        function updateCompletionsFromData(data, cb){
            getCompletionStore().all(function(err, completion){
                if( !_.has(completion, 'names') )
                    completion.names = [];
                if( !_.has(completion, 'dishes') )
                    completion.dishes = [];

                completion.names =  utils.mergeToNames(completion.names, data.names);
                completion.dishes =  utils.mergeToDishes(completion.dishes, data.dishes);

                completionStore.save('names', completion.names, function(){
                    completionStore.save('dishes', completion.dishes, cb);
                });
            });
        }

        return {

            getCompletions: function(cb){
                getCompletionStore().all(function(err, completions){
                    if(err) console.error(err);
                    cb(err, completions);
                });
            },

            // take all the stuff in the choices db and put it in completions
            updateCompletionStore: function(cb){
                getNamesAndDishesFromChoicesStore(function(fromChoicesDb){
                    updateCompletionsFromData(fromChoicesDb, cb);
                });
            },

            updateCompletionsFromData: updateCompletionsFromData,

            getTodaysData: function(cb){
                var today = utils.currentDataFile();
                getChoicesStore().all(function(err, days){
                    if(err) console.error(err);
                    if( !_.has(days, today) ){
                        days[today] = { choices: [] };
                    }
                    days[today].choices = utils.normalizeChoices(days[today].choices);
                    cb(err, days[today]);
                });
            },

            setTodaysData: function(data, cb){
                var today = utils.currentDataFile();
                data.choices = utils.normalizeChoices(data.choices);
                choicesStore.save(today, data, cb);
            }
        };
    },
};
