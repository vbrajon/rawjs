# xtendjs
> Utility Library to extend javascript primitives, simpler than and inpired by [sugarjs](https://sugarjs.com/) and [lodash](https://lodash.com/)

### WIP

- String, Number, Function, Date, DOM utilities
- Documentation
- unpkg.com
- shorthand dot notation 'a.b.c'
- Advanced: Ability to extend wrapping
- optional: prettier, eslint, git-hooks, benchmark in browsers, .circleci, .github, git-bot

### Usage
- Browser `<script src="https://unpkg.com/xtend"></script>` then `xtend()`
- Node `npm install --save xtendjs` then `const xtend = require('xtendjs')` and `xtend()`

### Concept
- Extends Object with `map`, `reduce`, `filter`, `find` and `keys`, `values`, `assign`
- Extends Array, String, Number, Function, Date, and global context with utilities
- Provides a way to add custom funtions or remove unwanted functions before extending
- Provides shorthands and ability to add more
- Short Codebase, single file, no dependencies
- Simple functions, inspired by https://30secondsofcode.org

### Why ?
Iterating over object as easily as array was crucial for me for quick prototyping or data manipulation or developer onboarding.

It is probably evil to override Object.prototype or global context but it was also making me start quicker new ideas.

If you control your environment and don't have (or few) dependencies, then using `xtend` will probably help you.

I enjoyed using Sugar but decided to replace it by something simpler to minimise API overhead.

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
