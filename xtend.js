const xtend = () => {
  const ctx = typeof global === 'object' && global.global === global && global || this
  for (const primitive in xtend) {
    for (const name in xtend[primitive]) {
      Object.defineProperty(ctx[primitive].prototype, name, {
        value: function() { return xtend[primitive][name](this, ...arguments) }
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
  find: (o, fn) => Object.keys(o).find(k => fn(o[k], k)),
}

xtend.Array = {
  first: a => a[0],
  last: a => a.slice(-1)[0],
}

// const { version } = require('./package.json')
// xtend.version = version

// export default xtend
module.exports = xtend
