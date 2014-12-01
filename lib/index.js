var _ = require("underscore");

var stat = function(seqs){
  // if someone forgets new
  if(this.constructor != stat){
    return new stat(seqs);
  }
  if(seqs == undefined || !Array.isArray(seqs) || typeof seqs == "string"){
    throw new TypeError("you need to give the seq stat an array");
  }
  //if(seqs.length == 0){
    //throw new TypeError("you need to give the seq stat a real array");
  //}
  this.resetSeqs(seqs);
  this.alphabetSize = 4;
  this._useBackground = false;
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
  this.seqs = [];

  // support sequence models
  if(seqs.constructor.name != "Array"){
    this.mseqs = seqs;
    var mSeqsPluck = function(){
      var seqArr = this.mseqs.pluck("seq");
      this.resetSeqs(seqArr);
    }
    seqs.on("add change reset ",mSeqsPluck, this);
    mSeqsPluck.call(this);
  }else{
    this.addSeqs(seqs);
  }
  this._reset();
  this.trigger("reset");
}

stat.prototype._reset = function _reset(){
  this._consensus = undefined;
  this._frequency = undefined;
  this._background = undefined;
  this._identity = undefined;
  this._maxLength = undefined;
  this._ic = undefined;
}

// neat auto-wrappers
stat.prototype.consensus = function consensus(){
  if(this._consensus == undefined){
    this.consensusCalc();
  }
  return this._consensus;
}

stat.prototype.setDNA = function setNucleotide(){
  this.alphabetSize = 4;
};

stat.prototype.setProtein = function setDNA(){
  this.alphabetSize = 20;
};

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

// set your own background with obj.bg
stat.prototype.background = function background(){
  if(this.bg !== undefined){
    return this.bg;
  }
  if(this._background == undefined){
    this.backgroundCalc();
  }
  return this._background;
}

stat.prototype.ic = function ic(){
  if(this._ic == undefined){
    this.icCalc();
  }
  return this._ic;
};

stat.prototype.maxLength = function maxLength(){
  if(this._maxLength == undefined){
    this.maxLengthCalc();
  }
  return this._maxLength;
}

stat.prototype.setBackground = function setBackground(b){
  this._useBackground = b;
  this._reset();
};

stat.prototype.useBackground = function useBackground(b){
  this.setBackground(true);
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

// information content after Shannon
stat.prototype.icCalc = function icCalc(seqs) {
  var f = this.frequency(); 
  if(this._useBackground){
    var b = this.background();
  }
  var useBackground = this._useBackground;
  var ic =_.map(f, function(el,i) {
    return  _.reduce(el, function(memo,val,c) {
      if(useBackground){
        val = val / b[c];
      }
      return memo - val * (Math.log(val) / Math.log(2)); 
    },0);
  });
  this._ic = ic;
  return ic;
};

// sequence conservation after Schneider and Stephens (1990)
// @cite Schneider, T.D. and Stephens, R.M. 1990. Sequence logos: A new way to
// display consensus sequences. Nucleic Acids Res. 18: 6097–6100.
stat.prototype.conservation = function conservation(alphabetSize) {
  var ic = this.ic(); 
  var alphabetSize = alphabetSize || this.alphabetSize;
  var icMax = Math.log(alphabetSize) / Math.log(2);
  var conserv =_.map(ic, function(el) {
    return icMax - el;
  });
  return conserv;
};

// sequence conservation after Schneider and Stephens (1990)
// conservation for each amino acid
stat.prototype.conservResidue = function conservation(input) {
  var alphabetSize = input ? input.alphabetSize : undefined;
  if(input !== undefined && input.scaled){
    var ic = this.scale(this.conservation(alphabetSize));
  }else{
    var ic = this.conservation(alphabetSize); 
  }
  var f = this.frequency(); 
  var conserv =_.map(f, function(el,i) {
    return  _.mapValues(el, function(val) {
      return val * ic[i]; 
    },0);
  });
  return conserv;
};

// type 2 sequence logo method
// scales relative to background
stat.prototype.conservResidue2 = function conservation(alphabetSize) {
  var f = this.frequency(); 
  var ic = this.conservation(alphabetSize); 
  var b = this.background();
  var conserv =_.map(f, function(el,i) {
    return  _.map(el, function(val) {
      var sum = _.reduce(f[i], function(memo,e){
        return memo + e / b[i];
      },0);
      return ((val / b[i]) / sum) * ic[i]; 
    },0);
  });
  return conserv;
};

// scale information content or conservation to 1
stat.prototype.scale = function conservation(ic,alphabetSize) {
  var alphabetSize = alphabetSize || this.alphabetSize;
  var icMax = Math.log(alphabetSize) / Math.log(2);
  var conserv =_.map(ic, function(el) {
    return el / icMax;
  });
  return conserv;
}

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

require("biojs-events").mixin(stat.prototype);

module.exports = stat;
