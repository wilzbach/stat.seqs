# biojs-stat-seqs

[![NPM version](http://img.shields.io/npm/v/biojs-stat-seqs.svg)](https://www.npmjs.org/package/biojs-stat-seqs) 
[![Build Status](https://secure.travis-ci.org/greenify/biojs-stat-seqs.png?branch=master)](http://travis-ci.org/greenify/biojs-stat-seqs) 

> A module to analye multiple seqs (information content, frequency, ...)

## Getting Started
Install the module with: `npm install biojs-stat-seqs`

```javascript
var MSAStats = require('biojs-stat-seqs');
var seqs = ["AACG", "CACG", "AAGC", "CAAG"];
var stats = MSAStats(seqs);
```

All operations are cached, but they will be calculated again if you change the sequences.

## Operations


```
stats.frequency() // calculates the relative frequency of a base at a given position
> [ { A: 0.5, C: 0.5 },
  { A: 1 },
  { C: 0.5, G: 0.25, A: 0.25 },
  { C: 0.25, G: 0.75 } ]

stats.consensus() // calculates the consensus
> "AACG"

stats.identity() // identity to the consensus seq
> [ 1, 0.75, 0.5, 0.5 ]

stats.identity("AAAA") // identity to the given seq
> [ 0.5, 0.25, 0.5, 0.5 ]

stats.background()
> { A: 0.4375, C: 0.3125, G: 0.25 }

stats.maxLength() 
> 4
```

### Operate with the sequences

```
stats.addSeq("AAA")
stats.addSeqs(["AAA", "AAB"])
stats.resetSeqs(["AAA", "AAB"])
stats.removeSeq("AAA")
stats.removeSeq(2) // you can also use indexes
```

## Contributing

Please submit all issues and pull requests to the [greenify/biojs-stat-seqs](http://github.com/greenify/biojs-stat-seqs) repository!

## Support
If you have any problem or suggestion please open an issue [here](https://github.com/greenify/biojs-stat-seqs/issues).

## License 

The MIT License

Copyright (c) 2014, greenify

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.


