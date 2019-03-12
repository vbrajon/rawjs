# XtendJS

Utility Library to extend javascript primitives.  
Simpler than and inspired by [sugarjs](https://sugarjs.com/) and [lodash](https://lodash.com/).

### API - Roadmap

- [x] Object # map, reduce, filter, find, keys, values, entries, assign
- [x] Array # group, sort, unique, first, last, min, max, sum, median, average
- [x] Function # debounce, throttle, delay, every, cancel, memoize, partial
- [x] String # format, words, join, lower, upper, capitalize
- [x] Number # format, [math], duration
- [x] Date # format, plus, minus, start, end, relative
- [x] Add/Remove functions
- [ ] Add/Remove shorthands
- [x] Unit Tests
- [x] Performance Benchmarks
- [ ] Documentation
- [ ] Typescript
- [x] Prettier
- [x] CLI
- [ ] .circleci
- [ ] .github # OR contribute directly via https://xtendjs.com
- [ ] RegExp # escape
- [ ] Browser # DOM $, $\$ / same, is

### Usage

- Browser `<script src="https://xtendjs.com/xtend.js"></script>` then `xtend()`
- Node `npm i xtendjs` then `require('xtendjs')()`
- CLI `npm i -g xtendjs` then `echo [1, 2] | x '.sum()'`

### Concept

- Extends Object with `map`, `reduce`, `filter`, `find` and `keys`, `values`, `entries`, `assign`
- Extends Array, Function, String, Number, Date
- Provides a way to add/remove custom functions/shorthands
- Short Codebase, single file, no dependencies, simple functions

### Why ?

Iterating over object as easily as array was crucial for me to prototype, manipulate data and onboard developers.

It is evil to override Object.prototype or global context but it was also making me start quicker new ideas.

If you control your environment and have few dependencies, then using `xtend` will probably help you.

I enjoyed using Sugar but decided to replace it by something simpler to minimise the API overhead.

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
