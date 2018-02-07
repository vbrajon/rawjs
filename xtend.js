const xtend = () => {
  const ctx = typeof global === 'object' && global.global === global && global || this
  for (const primitive in { Object: true, Array: true }) {
    for (const fname in xtend[primitive]) {
      Object.defineProperty(ctx[primitive].prototype, fname, {
        value: function() {
          return xtend[primitive][fname](this, ...xtend.wrap(arguments, fname))
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

xtend.Array = {
  // maximum call stack when calling Object.map > calling Array.map > calling Object.map ...
  // map: [].map,
  // reduce: [].reduce,
  // filter: [].filter,
  // find: [].find,
  // groupBy
  // sortBy
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

xtend.wrap = (args, fname) => {
  if (['map', 'filter', 'find'].includes(fname)) {
    const arg0 = args[0]
    args[0] = arg0 ? typeof arg0 === 'function' ? args[0] : x => x[arg0] : x => x
  }
  return args
}

// export default xtend
module.exports = xtend
