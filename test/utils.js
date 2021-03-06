var should = require("should");

describe('Utility functions', function(){
    var utils = require('../src/utils');
    describe('nth', function(){
        it('should return the nth elements of the list of lists', function(){
            ['aa', 'cde', 'eyu'].should.eql(utils.nth([['aa', 'bd'], ['cde', 'd'], ['eyu', 'f'] ], 0));
        });
    });

    describe('comparer', function(){
        it('should prepare string for compare', function(){
            "abdec efg f fat trudd v 12".should.eql(utils.comparer("   --$$abDéc Efg- f ; + fàT trUdd v 12 "));
        });
    });

    describe('capitalize', function(){
        it('should capitalize', function(){
            "Abdc Efgft Truv".should.eql(utils.capitalize("abDc EfgfT trUv"));
        });
    });

    describe('normalizeUserName', function(){
        it('should normalize', function(){
            "Ab C; T'est Plo-up".should.eql(utils.normalizeUserName("-Ab  c; t'EsT plo-uP"));
        });
        it('should keep all-caps', function(){
            "ABC".should.eql(utils.normalizeUserName("ABC"));
        });
    });

    describe('normalizeDishName', function(){
        it('should normalize', function(){
            "-ab C; T'est Plo-up".should.eql(utils.normalizeDishName("-Ab  c; t'EsT plo-uP"));
        });
        it('should not keep all-caps', function(){
            "Abc".should.eql(utils.normalizeDishName("ABC"));
        });
    });

    describe('getNormalizedUserNames', function(){
        it('should return a modified choices array', function(){
            ['Abd', 'ZEF', 'Qrt'].should.eql(utils.getNormalizedUserNames([['ABd', 'bbb'], ['ZEF', 'dddd'], ['  qrt', 'ffff']]));
        });
    });

    describe('getNormalizedDishNames', function(){
        it('should return a modified choices array', function(){
            ['Abd', 'Zef', 'Qrt'].should.eql(utils.getNormalizedDishNames([['bbb', 'ABd'], ['dddd', 'ZEF'], ['ffff', '  qrt']]));
        });
    });

    describe('normalizeChoices', function(){
        it('should return a modified choices array', function(){
            [[ 'Bbb', 'Abd'], ['Dddd', 'Zef'], ['Ffff', 'Qrt']].should.eql(utils.normalizeChoices([['bbb', 'ABd'], ['dddd', 'ZEF'], ['ffff', '  qrt']]));
        });
    });

    describe('mergeToNames', function(){
        it('should return a merged name array', function(){
            ["JBR"].should.eql(utils.mergeToNames([], ["JBR"]));
            ["JBR", "jehan"].should.eql(utils.mergeToNames(["JBR", "jehan"], ["JBR", "JEhan"]));
        });
    });

    describe('mergeToDishes', function(){
        it('should return a merged name array', function(){
            ["Pain Talon"].should.eql(utils.mergeToDishes([], ["Pain Talon"]));
            ["Pain Talon"].should.eql(utils.mergeToDishes([], ["Pain Talon", "pain talon"]));
            ["Pain Talon"].should.eql(utils.mergeToDishes([], ["Pain Talon", "pain talon", "Pain' Talon."]));
        });
    });
});
