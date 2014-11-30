/*
 * biojs-stat-seqs
 * https://github.com/greenify/biojs-stat-seqs
 *
 * Copyright (c) 2014 greenify
 * Licensed under the MIT license.
 */

// chai is an assertion library
var chai = require('chai');

require("./mochaFix");

var assert = chai.assert;
var equal = assert.deepEqual;
var _ = require("underscore");

// requires your main app (specified in index.js)
var statProgram = require('..');
var stat;

beforeEach("prepare stat", function(){
  var seqs = ["AAABB",
    "ACCCB",
    "AATTC"];
    stat = new statProgram(seqs);
});

describe('biojs-stat-seqs module', function(){

  describe('#wrong input()', function(){
    it('string input', function(){
      assert.throws(function(){statProgram("AA")},TypeError);
    });
    it('no input', function(){
      assert.throws(function(){statProgram()},TypeError);
    });
    it('empty array', function(){
      assert.throws(function(){statProgram([])},TypeError);
    });
  });

  describe('#consensus()', function(){
    it('test default', function(){
      equal(stat.consensus(), "AAABB");
    });

    it('test different length', function(){

      var seqs = ["AAABB",
        "ACCCBCC",
        "AATTC"];
        stat.resetSeqs(seqs);

        equal(stat.consensus(), "AAABBCC");
    });
  });

  describe('#identityCalc()', function(){
    it('test default', function(){
      equal(stat.identity(), [ 1, 0.4, 0.4 ]);
    });
    it('test different length', function(){

      var seqs = ["EAABB",
        "ACCCBCC",
        "AATTC"];
        stat.resetSeqs(seqs);

        equal(roundMap(stat.identity()), [ 0.8, 0.57, 0.4 ]);
    });

    it('different seq', function(){
      equal(stat.identity("AAAAA"), [ 0.6, 0.2, 0.4 ]);
    });
    it('do not cache the output', function(){
      equal(stat.identity("AAAAA"), [ 0.6, 0.2, 0.4 ]);
      equal(stat.identity(), [ 1, 0.4, 0.4 ]);
      equal(stat.identity("BBBBB"), [ 0.4, 0.2, 0.0 ]);
      equal(stat.identity("AAAAA"), [ 0.6, 0.2, 0.4 ]);
    });
  });

  describe('#background()', function(){
    it('test default', function(){
      equal(roundMap(stat.background()), {A: 0.4, B: 0.2, C: 0.27, T: 0.13});
    });
    it('test different length', function(){

      var seqs = ["EAABB",
        "ACCCBCC",
        "AATTC"];
        stat.resetSeqs(seqs);

        equal(roundMap(stat.background()), {A: 0.29, B: 0.18, C: 0.35, T: 0.12, E: 0.06 });
    });
  });


  describe('#addSeqs()', function(){

    it('test different length', function(){

      equal(stat.consensus(), "AAABB");
      var seqs = [
        "AAABB",
        "ACCCB",
        "AATTC"];
        stat.resetSeqs(seqs);
        equal(stat.consensus(), "AAABB");
        stat.addSeq("AATTC");
        equal(stat.consensus(), "AATTB");
        stat.addSeqs(["AAABB", "AAABB"]);
        equal(stat.consensus(), "AAABB");
    });
  });

  describe('#maxLength()', function(){

    it('test length change', function(){
      equal(stat.maxLength(), 5);
      stat.addSeq("AATTCO");
      equal(stat.maxLength(), 6);
    });

    it('test with an array', function(){
      stat.addSeqs(["AAABBTT", "AAABB"]);
      equal(stat.maxLength(), 7);
    });
  });

  describe('#removeSeq()', function(){

    it('test remove by string', function(){
      equal(stat.maxLength(), 5);
      stat.addSeq("AATTCO");
      equal(stat.maxLength(), 6);
      stat.removeSeq("AATTCO");
      equal(stat.maxLength(), 5);
    });

    it('test remove by arr', function(){
      stat.addSeqs(["AAABBTT", "AAABB"]);
      equal(stat.maxLength(), 7);
      stat.removeSeq(3);
      equal(stat.maxLength(), 5);
    });
  });

  describe('#frequency()', function(){
    it('test default', function(){
      equal(roundArrMap(stat.frequency()), [ { A: 1 },
            { A: 0.67, C: 0.33 },
            { A: 0.33, C: 0.33, T: 0.33 },
            { B: 0.33, C: 0.33, T: 0.33 },
            { B: 0.67, C: 0.33 } ]);
    });
    it('test different length', function(){

      var seqs = ["EAABB",
        "ACCCBCC",
        "AATTC"];
        stat.resetSeqs(seqs);
        equal(roundArrMap(stat.frequency()), [ { E: 0.33, A: 0.67 },
              { A: 0.67, C: 0.33 },
              { A: 0.33, C: 0.33, T: 0.33 },
              { B: 0.33, C: 0.33, T: 0.33 },
              { B: 0.67, C: 0.33 },
              { C: 1 },
              { C: 1 } ]);
    });
  });

  describe('#ic()', function(){
    it('test default', function(){
      equal(roundMap(stat.ic()), [ 0, 0.92, 1.58, 1.58, 0.92 ]);
    });
    it('test different length', function(){

      var seqs = ["GAABB",
        "ACCCGCC",
        "AATTC"];
        stat.resetSeqs(seqs);

        equal(roundMap(stat.ic()), [ 0.92, 0.92, 1.58, 1.58, 1.58, 0, 0 ] );
    });
    it('scaled', function(){
      equal(roundMap(stat.scale(stat.ic())), [ 0, 0.46, 0.79, 0.79, 0.46 ]);
    });
  });

  describe('#conservation()', function(){
    it('test default', function(){
      equal(roundMap(stat.conservation()), [ 2, 1.08, 0.42, 0.42, 1.08 ] );
    });
    it('test different length', function(){

      var seqs = ["GAABB",
        "ACCCGCC",
        "AATTC"];
        stat.resetSeqs(seqs);

        equal(roundMap(stat.conservation()), [ 1.08, 1.08, 0.42, 0.42, 0.42, 2, 2 ]);
    });

    it('scaled', function(){
      equal(roundMap(stat.scale(stat.conservation())), [ 1, 0.54, 0.21, 0.21, 0.54 ] );
    });
  });


  describe('#conservation per letter()', function(){
    it('test default', function(){
      var res = roundMapMap(stat.conservResidue());
      equal(res, [ { A: 2 },
            { A: 0.72, C: 0.36 },
            { A: 0.14, C: 0.14, T: 0.14 },
            { B: 0.14, C: 0.14, T: 0.14 },
            { B: 0.72, C: 0.36 } ]
           );
    });
    it('test different length', function(){

      var seqs = ["GAABB",
        "ACCCGCC",
        "AATTC"];
        stat.resetSeqs(seqs);

        var res = roundMapMap(stat.conservResidue());
        equal(res, [ { G: 0.36, A: 0.72 },
              { A: 0.72, C: 0.36 },
              { A: 0.14, C: 0.14, T: 0.14 },
              { B: 0.14, C: 0.14, T: 0.14 },
              { B: 0.14, G: 0.14, C: 0.14 },
              { C: 2 },
              { C: 2 } ]);
    });

    it('scaled', function(){
      var res = roundMapMap(stat.conservResidue({scaled: true}));
      equal(res, [ { A: 1 },
            { A: 0.36, C: 0.18 },
            { A: 0.07, C: 0.07, T: 0.07 },
            { B: 0.07, C: 0.07, T: 0.07 },
            { B: 0.36, C: 0.18 } ]
           );
    });
  });


});

function round(arr,to){
  return arr.map(function(el){
    return parseFloat(+el.toFixed(to || 2));
  })
}
function roundMap(arr,to){
  return _.each(arr,function(val,key,obj){
    obj[key] = parseFloat(+val.toFixed(to || 2));
  })
}

function roundArrMap(arr,to){
  return _.map(arr,function(e){
    return roundMap(e,to);
  });
}
function roundMapMap(arr,to){
  return _.each(arr,function(val,key,obj){
    obj[key] = val = roundMap(val,to);
    return val;
  });
}

