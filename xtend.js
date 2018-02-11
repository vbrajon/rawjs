const xtend = () => {
  const ctx = typeof global === 'object' && global.global === global && global || this
  ctx.is = is
  ctx.same = same

  for (const primitive in xtend) {
    if (primitive === primitive.toLowerCase()) return
    for (const fname in xtend[primitive]) {
      Object.defineProperty(ctx[primitive].prototype, fname, {
        configurable: true,
        value: function() {
          return xtend[primitive][fname](this, ...xtend.wrap(arguments, primitive, fname))
        },
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
  same,
}

const _map = [].map
const _reduce = [].reduce
const _filter = [].filter
const _find = [].find
xtend.Array = {
  map: (a, fn) => _map.bind(a)(fn),
  reduce: (a, fn, base) => _reduce.bind(a)(fn, base),
  filter: (a, fn) => _filter.bind(a)(fn),
  find: (a, fn) => _find.bind(a)(fn),
  same,
  groupBy,
  sortBy,
  flatten,
  unique,
  first: a => a[0],
  last: a => a.slice(-1)[0],
  min,
  max,
  sum,
}

xtend.String = {
  format,
  capitalize,
  titleize,
}

const { version } = require('./package.json')
xtend.version = version

// Wrapping function to provide shorthands
xtend.wrap = (args, primitive, fname) => {
  const arg0 = args[0]
  // Accessor shorthand
  if (['map', 'filter'].includes(fname)) {
    if (arg0 == undefined) return [x => x]
    if (typeof arg0 !== 'function') args[0] = x => x[arg0]
  }
  // Same shorthand
  if (['find'].includes(fname)) {
    if (arg0 == undefined) return [x => x]
    if (typeof arg0 !== 'function') args[0] = x => x.same ? x.same(arg0) : x === arg0
  }
  // Reduce shorthand
  if (['reduce'].includes(fname) && Array.isArray(args[1])) {
    if (args[0] == undefined) args[0] = (acc, v, k) => { acc.push(v);return acc }
    if (typeof args[0] !== 'function') args[0] = (acc, v, k) => { acc.push(v[arg0]);return acc }

    // NOTE: Convention: if function 1st argument is _ then wrap
    const underscore = fn => fn.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s))/mg,'').match(/[^\(]*\(\s*([^\)]*)\)/m)[1].split(',')[0] === '_'
    if (typeof args[0] === 'function' && underscore(args[0])) args[0] = (acc, v, k) => { acc.push(arg0(null, v, k));return acc }
  }
  // Sort shorthand
  if (['sortBy'].includes(fname)) {
    if (arg0 == undefined) return
    if (typeof arg0 !== 'function') args[0] = (a, b) => a[arg0] > b[arg0]
    // if (Array.isArray(arg0)) args[0] = x => x[arg0]
  }
  return args
}

module.exports = xtend
// ES6: export default xtend

function is(a, b) {
  if (b) return is(a) === is(b)
  if (a && a.prototype) return a.name.toLowerCase()
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

// https://30secondsofcode.org/#groupby > FIX use .push instead of .concat
function groupBy(arr, fn) {
  return arr.map(fn).reduce((acc, val, i) => {
    acc[val] = acc[val] || []
    acc[val].push(arr[i])
    return acc
  }, {})
}

// Non-Destructive sort
function sortBy(arr, fn) {
  return arr.slice().sort(fn)
}

// https://30secondsofcode.org/#flatten > default Infinity
function flatten(arr, depth = Infinity) {
  return depth !== 1
    ? arr.reduce((a, v) => a.concat(Array.isArray(v) ? flatten(v, depth - 1) : v), [])
    : arr.reduce((a, v) => a.concat(v), [])
}

// https://30secondsofcode.org/#unique
function unique(arr) {
  return [...new Set(arr)]
}

// https://30secondsofcode.org/#minn
function min(arr, n = 1) {
  return arr.slice().sort((a, b) => a - b).slice(0, n)
}

// https://30secondsofcode.org/#maxn
function max(arr, n = 1) {
  return arr.slice().sort((a, b) => b - a).slice(0, n)
}

// https://30secondsofcode.org/#sum
function sum(arr) {
  return arr.reduce((acc, val) => acc + val, 0)
}

function format(str, ...args) {
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
}

// https://30secondsofcode.org/#words > remove "-" from default pattern
function words(str, pattern = /[^a-zA-Z]+/) {
  return str.split(pattern).filter(Boolean)
}

function capitalize(str, lower = true) {
  return (lower ? str.toLowerCase() : str).replace(/./, char => char.toUpperCase())
}

function titleize(str) {
  return words(str.toLowerCase()).map(capitalize).join(' ')
}
