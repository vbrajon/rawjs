const xtend = () => {
  const ctx = typeof global === 'object' && global.global === global && global || this
  for (const primitive in { Object: true, Array: true }) {
    for (const fname in xtend[primitive]) {
      Object.defineProperty(ctx[primitive].prototype, fname, {
        value: function() {
          return xtend[primitive][fname](this, ...xtend.wrap(arguments, primitive, fname))
        }
      })
    }
  }
}

xtend.Object = {
  keys: Object.keys,
  values: Object.values,
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

const _map = [].map
const _reduce = [].reduce
const _filter = [].filter
const _find = [].find
xtend.Array = {
  map: (a, fn) => _map.bind(a)(fn),
  reduce: (a, fn, base) => _reduce.bind(a)(fn, base),
  filter: (a, fn) => _filter.bind(a)(fn),
  find: (a, fn) => _find.bind(a)(fn),
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
  if (['map', 'filter'].includes(fname)) {
    if (args[0] == undefined) return [x => x]
    const arg0 = args[0]
    args[0] = typeof arg0 === 'function' ? args[0] : x => x[arg0]
  }
  return args
}

// export default xtend
module.exports = xtend
