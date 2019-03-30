# RawJS

Utility library to extend javascript primitives.

---

## API

<api></api>

## Concepts

- Extends Object with `map`, `reduce`, `filter`, `find`
  ```js
  import raw from 'raw' // Once imported, you have access to the primitive APIs
  Object.filter({ k1: 1, k2: 2 }, v => v > 1)
  raw() // but objects are not extended until you call the raw() function
  ({ k1: 1, k2: 2 }).filter(v => v > 1)
  ```
- Extends Array, Function, String, Number, Date, RegExp
  ```js
  [2, 3, 5, 8, 11].sum()
  (() => console.log('Oh yeah')).every(1000)
  'Python calls this {}'.format('f-string')
  1002.3004.format('fr')
  new Date().end('month')
  /be-LESS-insensitive/i.minus('i')
  ```
- Shorthand
  ```js
  [0, 1, 2, null].filter() // [1, 2]
  [{ name: 'John' }, { name: 'Jane' }].map('name').find(/Jo/) // 'John'
  ```
- Immutability
  ```js
  const a = [5, 3, 11, 8, 2]
  const b = a.sort() // every functions are immutable, even sort (overridden)
  console.log(a, b) // [5, 3, 11, 8, 2], [2, 3, 5, 8, 11]
  ```
- Chaining
  ```js
  new Date()
    .plus('4 months')
    .minus('3 days')
    .format('year,month,day', 'fr')
  ```
- Extensibility
  ```js
  Number.chaos = num => num * Math.random() // add a function to a primitive
  raw() // extend prototypes
  (3).chaos() // between 0 and 3
  delete Number.chaos // remove a function from a primitive
  delete Number.prototype.chaos // remove an extension from a primitive
  ```
- Short Codebase, single file, simple functions, no dependencies
  - [~250 loc](https://github.com/vbrajon/rawjs/blob/master/raw.js)
  - [~100 tests](https://github.com/vbrajon/rawjs/blob/master/test-unit.js)
  - [3 benchmarks](https://github.com/vbrajon/rawjs/blob/master/test-perf.js)

## Advanced

- RawJS provides a CLI utility when installed globally
  ```bash
  npm i -g rawjs # or git clone && npm link --local
  curl -s https://jsonplaceholder.typicode.com/users | raw ".map('address.geo')"
  ```
- RawJS provides an automatic documentation mechanism, try:
  ```javascript
  // Open Devtools, add a function like the following
  Object.chaos = () => Math.random()
  // Scroll to API and click on a Object to see it appear
  ```
  <a style="position: absolute;margin-top: -55px;" class="button" href="#api">Scroll Up</a>
- RawJS only provides an ESM version for now.  
  **Bash / Node**
  ```bash
  #!/usr/bin/env node -r esm
  import raw from 'raw'
  raw()
  console.log([1, 2, 3].sum())
  ```
  **Browser / Vuejs**
  ```html
  <main>
    <input v-model="search" />
    <div :text="table.filter(RegExp(search))"></div>
    # Note the use of .filter(RegExp) shorthand provided by RawJS
  </main>
  <script type="module">
    import Vue from 'https://unpkg.com/vue@2.6.10/dist/vue.esm.browser.js'
    import raw from 'https://vbrajon.github.io/rawjs/raw.js'
    raw()
    new Vue({
      el: 'main',
      data: {
        table: Array(100).fill(0).map((_, i) => i),
        search: '',
      },
    })
  </script>
  ```
- Add or remove shorthands is a bit tricky ATM:
  ```js
  // Modify the `raw.wrap` function with the following signature:
  raw._wrap = raw.wrap
  raw.wrap = (args, primitive, fname, ctx) => {
    if (fname === 'sort' && args[0] === '-') return [(a, b) => b - a]
    return raw._wrap(args, primitive, fname, ctx)
  }
  ```
- Non enumerable functions are not added by default, they can be added with:
  ```js
  Object.prototype.keys = Object.keys
  Object.prototype.values = Object.values
  ```
- Be extra careful with extending Object prototype as it will be available everywhere
  ```js
  ''.map() || 1..map() || /rx/.map() // return {} instead of throwing error
  ```
- Array `sort` and `reverse` are overridden. They are extensively used internally by the JS engine so you may want to deactivate the shorthand. This will remove immutability for those functions.
  ```js
  Array.prototype.sort = Array.prototype._sort
  Array.prototype.reverse = Array.prototype._reverse
  delete Array.sort
  delete Array.reverse
  ```

---

```css
.api { position: relative; }
.api > .row { position: absolute;top: 0;left: -250px;width: 250px; }
.api > .row > .column { flex: 1;text-align: right; }
.api > .row > .column > * { cursor: pointer;padding: 10px;background: #f5f5f5; }
.api > .row > .column > .active { position: relative;right: -4px;border-right: 4px solid #fd4;background: #eee;font-weight: 600; }
.api > pre { min-height: 180px;border-radius: 0; }
```

```js
document.title = 'RawJS'
document.querySelector('[rel=icon]').href = 'https://vbrajon.github.io/rawjs/r.png'

import('https://vbrajon.github.io/rawjs/raw.js')
  .then(m => (window.raw = m.default))
  .then(() => raw())
  .then(() => ($('main').__vue__.file = $('main').__vue__.file + ' ')) // HACK force reload

Vue.component('api', {
  template: `<div class="api">
    <div class="row" v-if="window.innerWidth > 1200">
      <div class="column">
        <div :class="{ active: pname === primitive.name }" @click="pname = primitive.name;fname = Object.keys(window[pname])[0]" v-for="primitive in [Object, Array, Function, String, Number, Date, RegExp]">{{ primitive.name }}</div>
      </div>
      <div class="column">
        <div :class="{ active: fname === fn }" @click="fname = fn" v-for="fn in Object.keys(window[pname])">{{ fn }}</div>
      </div>
    </div>
    <div v-else>
      <select @change="pname = $event.target.value;fname = Object.keys(window[pname])[0]">
        <option v-for="primitive in [Object, Array, Function, String, Number, Date, RegExp]">{{ primitive.name }}</option>
      </select>
      <select @change="fname = $event.target.value">
        <option v-for="fn in Object.keys(window[pname])">{{ fn }}</option>
      </select>
    </div>
    <pre><code lang="language-js" v-html="Prism.highlight('' + window[this.pname][this.fname], Prism.languages.javascript, 'js')"></code></pre>
  </div>`,
  data() {
    return {
      pname: 'Object',
      fname: 'map',
    }
  },
})
```

---
