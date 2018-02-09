const xtend = () => {
  const ctx = typeof global === 'object' && global.global === global && global || this
  for (const primitive in { Object: true, Array: true }) {
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

// Code from: https://github.com/epoberezkin/fast-deep-equal/blob/master/index.js
const equal = (a, b) => {
  if (a === b) return true
  const arrA = Array.isArray(a)
  const arrB = Array.isArray(b)
  let i

  if (arrA && arrB) {
    if (a.length != b.length) return false
    for (i = 0; i < a.length; i++)
      if (!equal(a[i], b[i])) return false
    return true
  }

  if (arrA != arrB) return false

  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const keys = Object.keys(a)
    if (keys.length !== Object.keys(b).length) return false

    const dateA = a instanceof Date
    const dateB = b instanceof Date
    if (dateA && dateB) return a.getTime() == b.getTime()
    if (dateA != dateB) return false

    const regexpA = a instanceof RegExp
    const regexpB = b instanceof RegExp
    if (regexpA && regexpB) return a.toString() == b.toString()
    if (regexpA != regexpB) return false

    for (i = 0; i < keys.length; i++)
      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false

    for (i = 0; i < keys.length; i++)
      if(!equal(a[keys[i]], b[keys[i]])) return false

    return true
  }

  return false
}
xtend.same = equal

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
  same: xtend.same,
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
  same: xtend.same,
  // groupBy: a => a.reduce(),
  // sortBy: a => a.map(x => x).
  first: a => a[0],
  last: a => a.slice(-1)[0],
  // flatten
  // unique
  // intersect
  // zip
  // average
  // max
  // median
  // min
  // sum
}

const { version } = require('./package.json')
xtend.version = version

xtend.wrap = (args, primitive, fname) => {
  const arg0 = args[0]
  if (['map', 'filter'].includes(fname)) {
    if (arg0 == undefined) return [x => x]
    args[0] = typeof arg0 === 'function' ? args[0] : x => x[arg0]
  }
  if (['find'].includes(fname)) {
    if (arg0 == undefined) return [x => x]
    args[0] = typeof arg0 === 'function' ? args[0] : x => x.same ? x.same(arg0) : x === arg0
  }
  return args
}

// export default xtend
module.exports = xtend
