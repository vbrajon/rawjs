# RawJS

Utility Library to extend javascript primitives.  
Simpler than and inspired by lodash or sugar.

### API - Roadmap

- [x] Object # map, reduce, filter, find
- [x] Array # sort, group, unique, first, last, min, max, sum, median, average
- [x] Function # debounce, throttle, delay, every, cancel, memoize, partial
- [x] String # format, words, join, lower, upper, capitalize
- [x] Number # format, [math], duration
- [x] Date # format, plus, minus, start, end, relative
- [ ] RegExp # format, escape
- [x] Prettier
- [ ] Typescript
- [x] Unit Tests
- [x] Performance Benchmarks
- [ ] Documentation # use, api (try, test, source), examples, why, comparison, compatibility
- [x] CLI
- [ ] Browser # DOM $, $\$ / same, is
- [ ] .circleci
- [ ] .github # OR contribute directly via https://xtendjs.com

### Docs

To remove a function:
```js
delete Object.map
delete Object.prototype.map
```

To add a shorthands:
```js
raw._wrap = raw.wrap
raw.wrap = (args, primitive, fname, ctx) => {
  if (fname === 'map') return [x => 42]
  return raw._wrap(args, primitive, fname, ctx)
}
```

Immutability everywhere

Example using an external lib using .keys > .raw('k', 'v', 'e', {}) instead of keys, values, entries, assign

You may want to add even more shorthands to Object such as:
```js
Object.prototype.keys = Object.keys
Object.prototype.values = Object.values
```

Sort is extensively used in internally so you may want to deactivate shorthand and immutability for this function.

```js
Array.prototype.sort = Array.prototype._sort
```

### Usage

- Browser `<script src="https://rawjs.com/raw.js"></script>` then `raw()`
- Node `npm i rawjs` then `require('rawjs')()`
- CLI `npm i -g rawjs` then `echo [1, 2] | x '.sum()'`

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
