import Benchmark from 'benchmark'
import _ from 'lodash'
import Sugar from 'Sugar'
import './raw.js'

const n = 10000
const a = []
const o = {}
for (let i = 0; i < n; ++i) {
  a[i] = Math.random() * 2 - 1
  o[String.fromCodePoint(i)] = Math.random() * 2 - 1
}

const fnames = ['map', 'reduce', 'filter', 'find']
const libnames = ['raw', 'sugar', 'lodash']
fnames.map(fname => {
  const suite = new Benchmark.Suite('#' + fname)
  libnames.map(libname => {
    // Arguments
    const map_fn = v => v
    const reduce_fn = (acc, v, k) => {
      acc.push(v)
      return acc
    }
    const args = {
      map: [o, map_fn],
      reduce: [o, reduce_fn, []],
      filter: [o, map_fn],
      find: [o, map_fn],
    }[fname]
    const libfn = {
      lodash: _,
      sugar: Sugar.Object,
      raw: Object,
    }[libname][fname]

    // Input & Output for the current Test Run
    const stringify = arg => {
      const type = Object.prototype.toString
        .call(arg)
        .slice(8, -1)
        .toLowerCase()
      if (type === 'function') return arg.toString()
      if (type === 'array') return '[ ' + stringify(arg[0]) + ' <' + arg.length + '> ]'
      if (type === 'object') return '{ ' + Object.keys(arg)[0] + ': ' + stringify(Object.values(arg)[0]) + ' <' + Object.keys(arg).length + '> }'
      if (type === 'string') return arg.length > 3 ? arg.slice(0, 3) + '...' : arg
      if (type === 'number') return arg.toPrecision(2)
    }
    const current = libname + '#' + fname
    const input = '(' + args.map(stringify).join(', ') + ')'
    const output = stringify(libfn(...args))
    console.log(current, input, '>', output)
    suite.add(libname, () => libfn(...args))
  })

  suite
    .on('start', logStart)
    .on('cycle', logResults)
    .on('complete', logComplete)
    .run()
})

function logResults(e) {
  var t = e.target

  if (t.failure) {
    console.error(padl(10, t.name) + 'FAILED: ' + e.target.failure)
  } else {
    var result = padl(10, t.name) + padr(13, t.hz.toFixed(2) + ' op/s') + ' \xb1' + padr(7, t.stats.rme.toFixed(2) + '%') + padr(15, ' (' + t.stats.sample.length + ' samples)')

    console.log(result)
  }
}

function logStart() {
  console.log(this.name)
  console.log('-----------------------------------------------')
}

function logComplete() {
  console.log('-----------------------------------------------')
}

function padl(n, s) {
  while (s.length < n) {
    s += ' '
  }
  return s
}

function padr(n, s) {
  while (s.length < n) {
    s = ' ' + s
  }
  return s
}
