if('undefined' === typeof window )
    var _ = require('lodash');

var removeDiacritics = require('diacritics').remove;

var utils = {
    currentDataFile: function currentDataFile(){
        var d = new Date();
        var f = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
        return f;
    },

    nth: function(list, index){
        return _.map(list, function(e){ return e[index]; });
    },

    capitalize: function(s){ 
        return _.map(s.toLowerCase().split(' '), function(w){
            if(w.length < 2 ) return w;
            return _.capitalize(w);
        }).join(' '); 
    },

    comparer: function(s){ 
        var s = removeDiacritics(s.toLowerCase()).replace(/[-:;,./+='"|&!%{})(_~'$]/g, '').replace(/\s+/g,' ').trim();
        return s;
    }, 

    normalizeUserName: function(name){
        var doCapitalize = false;
        if(name.toUpperCase() !== name)
            doCapitalize = true;
        name = name.replace(/(^|\s)-/g,' ').replace(/\s+/g,' ').trim();
        if(doCapitalize) name = utils.capitalize(name);
        return name;
    },

    normalizeDishName: function(dish){
        return utils.capitalize(dish.replace(/\s+/g,' ').trim());
    },

    getNormalizedUserNames: function(choices){
        return _.map(utils.nth(choices, 0), utils.normalizeUserName);
    },

    getNormalizedDishNames: function(choices){
        return _.map(utils.nth(choices, 1), utils.normalizeDishName);
    },

    normalizeChoices: function(choices){
        return _.map(choices, function(choice){
            return [
                utils.normalizeUserName(choice[0]),
                utils.normalizeDishName(choice[1]),
            ];
        });
    },

    mergeArrays: function(a, b){
        return _.uniq(_.union(a, b), utils.comparer );
    },

    mergeToNames: function(names, dayData){
        return utils.mergeArrays(names, _.map(dayData, utils.normalizeUserName));
    },

    mergeToDishes: function(dishes, dayData){
        return utils.mergeArrays(dishes, _.map(dayData, utils.normalizeDishName));
    },
};

module.exports = utils;