const xtend = () => {
  for (const primitive of [Boolean, Number, String, Object, Array, Date, RegExp, Function]) {
    for (const fname in xtend[primitive.name]) {
      Object.defineProperty(primitive.prototype, fname, {
        enumerable: false,
        value: function() {
          return xtend[primitive.name][fname](this, ...xtend.wrap(arguments, fname, primitive))
        }
      })
    }
  }
}

xtend.Object = {
  keys: Object.keys,
  values: Object.values,
  assign: Object.assign,
  map: (o, fn) => Object.keys(o).reduce((acc, k, i) => {
    acc[k] = fn(o[k], k, i, o)
    return acc
  }, {}),
  reduce: (o, fn, base) => Object.keys(o).reduce((acc, k, i) => fn(acc, o[k], k, i, o), base),
  filter: (o, fn) => Object.keys(o).filter((k, i) => fn(o[k], k, i, o)).reduce((acc, k) => {
    acc[k] = o[k]
    return acc
  }, {}),
  find: (o, fn) => Object.keys(o).find((k, i) => fn(o[k], k, i, o)),
}

Array._map = [].map
Array._reduce = [].reduce
Array._filter = [].filter
Array._find = [].find
xtend.Array = {
  map: (a, fn) => Array._map.bind(a)(fn),
  reduce: (a, fn, base) => Array._reduce.bind(a)(fn, base),
  filter: (a, fn) => Array._filter.bind(a)(fn),
  find: (a, fn) => Array._find.bind(a)(fn),

  sortBy: (arr, fn) => arr.slice().sort(fn),
  groupBy: (arr, fn) => {
    return arr.map(fn).reduce((acc, val, i) => {
      acc[val] = acc[val] || []
      acc[val].push(arr[i])
      return acc
    }, {})
  },
  flatten: (arr, depth = Infinity) => depth !== 1
    ? arr.reduce((a, v) => a.concat(Array.isArray(v) ? xtend.Array.flatten(v, depth - 1) : v), [])
    : arr.reduce((a, v) => a.concat(v), []),
  unique: arr => [...new Set(arr)],
  first: arr => arr[0],
  last: arr => arr.slice(-1)[0],
  min: (arr, n = 1) => arr.slice().sort((a, b) => a - b).slice(0, n),
  max: (arr, n = 1) => arr.slice().sort((a, b) => b - a).slice(0, n),
  sum: arr => arr.reduce((acc, val) => acc + val, 0),
}

xtend.String = {
  format: (str, ...args) => {
    args.map((arg, i) => {
      if (typeof arg === 'object') return arg.map((v, k) => {
        const name_re = new RegExp('\\{' + k + '\\}', 'g')
        str = str.replace(name_re, v)
      })
      const null_re = /\{\}/
      const position_re = new RegExp('\\{' + i + '\\}', 'g')
      str = str.replace(null_re, arg)
      str = str.replace(position_re, arg)
    })
    return str
  },
  lower: str => str.toLowerCase(),
  upper: str => str.toUpperCase(),
  capitalize: str => str.replace(/./, c => c.toUpperCase()),
  words: (str, clean = /[^a-z0-9-_\s]+/gi, normalize = true) => str
    .normalize(normalize ? 'NFKD' : false)
    .replace(clean, '')
    .replace(/([a-z\d])([A-Z])/g,'$1 $2')
    .split(/[-_\s]/)
    .filter(Boolean),
  join: (str, sep = ' ', fn = 'lower', clean) => str.words(clean).map(fn).join(sep),
}

// Wrapping function to provide shorthands
xtend.wrap = (args, fname, primitive) => {
  if (args.length === 0) { // If no arguments, use default arguments
    if (['map', 'filter', 'find', 'sortBy'].includes(fname)) return [x => x]
    return []
  }

  const arg0 = args[0]
  if (['map', 'filter'].includes(fname)) { // Dot Accessor shorthand (property or function)
    if (typeof arg0 !== 'function') args[0] = x => ('' + arg0).split('.').reduce((x, p) => typeof x[p] === 'function' ? x[p]() : x[p], x)
  }
  if (['find'].includes(fname)) { // Same shorthand
    if (typeof arg0 !== 'function') args[0] = x => same(x, arg0)
  }
  if (['sortBy'].includes(fname)) { // Sort shorthand
    const directed_sort = p => (a, b) => {
      if (!/^-/.test(p)) return a[p] === b[p] ? 0 : a[p] > b[p] ? 1 : -1
      p = p.slice(1)
      return a[p] === b[p] ? 0 : a[p] > b[p] ? -1 : 1
    }
    const multi_sort = p => (a, b) => {
      if (!Array.isArray(p)) return directed_sort(p)(a, b)
      for (k of p) if (z = directed_sort(k)(a, b)) return z
    }
    if (typeof arg0 !== 'function') args[0] = multi_sort(arg0)
    if (typeof arg0 === 'function' && arg0.length === 1) args[0] = (a, b) => arg0(a) === arg0(b) ? 0 : arg0(a) > arg0(b) ? 1 : -1
  }
  return args
}

function is(a, b) {
  if (arguments.length > 1) return is(a) === is(b)
  if (a === Infinity) return 'infinity'
  if (typeof a === 'number' && isNaN(a)) return 'nan'
  if ([Boolean, Number, String, Object, Array, Date, RegExp].includes(a)) return a.name.toLowerCase()
  return Object.prototype.toString.call(a).slice(8, -1).toLowerCase()
}

// https://30secondsofcode.org/#equals > rename from equals to same
function same(a, b) {
  if (a === b) return true
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime()
  if (!a || !b || (typeof a != 'object' && typeof b !== 'object')) return a === b
  if (a === null || a === undefined || b === null || b === undefined) return false
  if (a.prototype !== b.prototype) return false
  let keys = Object.keys(a)
  if (keys.length !== Object.keys(b).length) return false
  return keys.every(k => same(a[k], b[k]))
}

if (typeof global === 'object' && global.global === global) {
  global.window = global
  window.is = is
  window.same = same
  xtend.version = require('./package.json').version
  module.exports = xtend
}
