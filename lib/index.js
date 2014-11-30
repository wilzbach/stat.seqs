var _ = require("underscore");

var stat = function(seqs){
 // if someone forgets new
 if(this.constructor != stat){
    return new stat(seqs);
  }
  if(seqs == undefined || !Array.isArray(seqs) || typeof seqs == "string"){
    throw new TypeError("you need to give the seq stat an array");
  }
  if(seqs.length == 0){
    throw new TypeError("you need to give the seq stat a real array");
  }
  this.seqs = seqs; 
};

stat.prototype.addSeq = function addSeq(seq){
  this.seqs.push(seq);
  this._reset();
}

stat.prototype.removeSeq = function addSeq(seq){
  // check for int or string
  if(typeof seq === 'number'){
    this.seqs.splice(seq,1);
  }else{
    // identify matches (we could have multiple)
    _.each(this.seqs,function(s,i){
      if(seq === s){
        this.seqs.splice(i,1);
      }
    }.bind(this));
  };
  this._reset();
}

stat.prototype.addSeqs = function addSeqs(seqs){
  seqs.forEach(function(seq){
    this.addSeq(seq);
  }.bind(this));
}

stat.prototype.resetSeqs = function reset(seqs){
  this.seqs = seqs;
  this._reset();
}

stat.prototype._reset = function _reset(){
  this._consensus = undefined;
  this._frequency = undefined;
  this._background = undefined;
  this._identity = undefined;
  this._maxLength = undefined;
}

// neat auto-wrappers
stat.prototype.consensus = function consensus(){
  if(this._consensus == undefined){
    this.consensusCalc();
  }
  return this._consensus;
}

stat.prototype.identity = function identitiy(seq){
  // do not cache if its called with a special compare seq
  if(this._identity == undefined || seq){
    var ident = this.identityCalc(seq);
    this._identity = undefined;
  }
  return this._identity || ident;
}

stat.prototype.frequency = function freq(){
  if(this._frequency == undefined){
    this.frequencyCalc();
  }
  return this._frequency;
}

stat.prototype.background = function identitiy(){
  if(this._background == undefined){
    this.backgroundCalc();
  }
  return this._background;
}

stat.prototype.maxLength = function maxLength(){
  if(this._maxLength == undefined){
    this.maxLengthCalc();
  }
  return this._maxLength;
}

// calculates the relative frequency of a base at a given position
// this is needed e.g. for the entropy calculation
// seqs: array of sequences (strings)
// @returns array of all positions with a dictionary of all bases with their relative frequency
stat.prototype.frequencyCalc = function frequencyCalc() {
  var occs, totalPerPos;
  occs = new Array(this.seqs.length);
  totalPerPos = new Array(this.seqs.length);

  // count the occurrences of the chars at a position
  _.each(this.seqs, function(el, i) {
    _.each(el, function(c, pos) {
      if (occs[pos] == null) {
        occs[pos] = {};
      }
      if (occs[pos][c] == null) {
        occs[pos][c] = 0;
      }
      occs[pos][c]++;
      if (totalPerPos[pos] == null) {
        totalPerPos[pos] = 0;
      }
      totalPerPos[pos]++;
    });
  });

  // normalize to 1
  _.each(occs, function(el,pos) {
    return _.each(el, function(val,c) {
      return occs[pos][c] = val / totalPerPos[pos];
    });
  });
  this._frequency = occs;
  return occs;
};

// seqs: array of sequences (strings)
stat.prototype.backgroundCalc = function backgroundCalc(seqs) {
  var occ = {};
  var total = 0;
  
  // count the occurences of the chars of a position
  _.each(this.seqs, function(el, i) {
    _.each(el, function(c, pos) {
      if (occ[c] == null) {
        occ[c] = 0;
      }
      occ[c]++;
      return total++;
    });
  });
  
  // normalize to 1
  occ = _.mapValues(occ, function(val,key,obj) {
    return val  / total;
  });
  this._background = occ;
  return occ;
};

stat.prototype.maxLengthCalc = function(){
  this._maxLength = _.max(this.seqs, function(seq){
    return seq.length
  }).length;
}

// seqs: array of sequences (strings)
 // @returns consenus sequence
stat.prototype.consensusCalc = function consensusCal () {
  var occs = new Array(this.maxLength());
  
  // count the occurrences of the chars of a position
  _.each(this.seqs, function(el, i) {
    _.each(el, function(c, pos) {
      if (occs[pos] == null) {
        occs[pos] = {};
      }
      if (occs[pos][c] == null) {
        occs[pos][c] = 0;
      }
      occs[pos][c]++;
    });
  });

  // now pick the char with most occurrences
  this._consensus =_.reduce(occs, function(memo, occ) {
    var keys;
    keys = _.keys(occ);
    return memo += _.max(keys, function(key) {
      return occ[key];
    });
  }, "");

  return this._consensus;
};

// seqs: array of sequences (strings)
// consensus: calculated consensus seq
// calculates for each sequence
// * matches with the consensus seq
// * identity = matchedChars / totalChars (excluding gaps)
// @returns: array of length of the seqs with the identity to the consensus (double)
stat.prototype.identityCalc = function identitiyCalc (compareSeq) {
  var consensus = compareSeq || this.consensus();
  this._identity = this.seqs.map(function(seq) {
    var matches = 0;
    var total = 0;
    for (var i = 0 ;i < seq.length; i++) {
      if (seq[i] !== "-" && consensus[i] !== "-") {
        total++;
        if (seq[i] === consensus[i]) {
          matches++;
        }
      }
    }
    return matches / total;
  });
  return this._identity;
};

_.mixin({ mapValues: function (obj, f_val) { 
  return _.object(_.keys(obj), _.map(obj, f_val));
}});

module.exports = stat;
