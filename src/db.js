var Store = require('jfs');
var utils = require('./utils');
var path = require('path');
var _ = require('lodash');

module.exports = {
    Database: function Database(config){
        var dbId = null;
        var store = null;

        function calculateDbId(){ return new Date().getFullYear(); }
        
        function getStore(){
            var newDbId = calculateDbId();
            if(null === store || dbId !== newDbId){
                dbId = newDbId;
                store = new Store(path.join(config.dataFolder, ""+dbId));
            }
            //console.log(store);
            return store;
        }

        return {
            getUniqueValuesFromScratch: function(cb){
                var names = [];
                var dishes = [];
                getStore().all(function(err, days){
                    // console.log("Days keys", _.keys(days));
                    if(err) console.error(err);
                    // console.log((days));
                    // console.log(_(days).keys().map(function(day){console.log(day);}).value());
                    _(days).keys().forEach(function(day){
                        // console.log(day);
                        // names get lowercased for compare because normalization
                        // ignore full-upercase strings (they are considered monograms/trigrams)
                        // console.log(">", days[day].choices);
                        names = _.uniq(_.union(names, utils.normalizeUserNames(days[day].choices)), utils.comparer );
                        dishes = _.uniq(_.union(dishes, utils.normalizeDishNames(days[day].choices)), utils.comparer );
                    }).value();
                    // console.log(names, dishes);
                    cb({ names: names, dishes: dishes });
                });

            },

            getTodaysData: function(cb){
                var today = utils.currentDataFile();
                getStore().all(function(err, days){
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
                store.save(today, data, cb);
            }
        };
    },
};