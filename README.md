# xtendjs
> Utility Library to extend javascript primitives

### Concept
- Extends Object with `map`, `reduce`, `filter`, `find`
- Extends Array with `first`, `last`
- Provides shorthand for extended function `x.map('name')` equals `x.map(d => d.name)`
- Provides a way to extend with custom funtions

### Usage
- Browser `<script src="https://xtendjs.com/xtend.js"></script>` then `xtend()`
- Node `npm install --save xtendjs` then `const xtend = require('xtendjs')` and `xtend()`

### Why ?
Sugar Issues:
- Too many functions
- New concepts to learn (Range)
- Strange API to extend: `Sugar.extend({ objectPrototype: true, methods: ['map', 'reduce'], enhanceString: false })`
- Some strange names
- Some slow functions

Lodash Issues:
- Too many functions
- New concepts to learn (Collection, Seq, Lang)
- Difference between lodashFP and lodash
- Difference between Seq \_() and \_.chain()

### Inspiration
- https://sugarjs.com/
- https://lodash.com/
