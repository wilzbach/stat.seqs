var _ = require("underscore");
var MSAStats = require('./');
var seqs = ["AACG", "CACG", "AAGC", "CAAG"];
var stats = MSAStats(seqs);

// Trivia

console.log("maxLength",stats.maxLength());

// Frequency

console.log("frequency", stats.frequency()); // calculates the relative frequency of a base at a given position


// Sequence identity and consensus

console.log(stats.consensus()) // calculates the consensus
console.log(stats.identity()) // identity to the consensus seq
console.log(stats.identity("AAAA")) // identity to the given seq

// Background

console.log("background", stats.background()) // calculates the background distribution of all seqs


// Information content and conservation


function ic(){

  console.log('ic',roundArr(stats.ic())) // calculates the information content

  // change your alphabet
  //console.log('',stats.setDNA(); // default
  //console.log('',stats.setProtein();

  // now you can scale the information content 
  console.log('scaled ic',roundArr(stats.scale(stats.ic())));

  console.log('conservation',roundArr(stats.conservation())) // needs an alphabetSize!
  console.log('conservation scaled',roundArr(stats.scale(stats.conservation()))) // needs an alphabetSize!

  console.log('conservation residue',roundArrMap(stats.conservResidue())) // calculate conservation per resdiue
  console.log('conservation residue scaled',roundArrMap(stats.conservResidue({scaled: true}))) // calculate conservation per resdiue
}

ic();
stats.useBackground();

console.log("using a background");

ic();



function roundArr(arr,to){
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
