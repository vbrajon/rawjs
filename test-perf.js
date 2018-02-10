const Benchmark = require('benchmark')

const _ = require('lodash')
const Sugar = require('Sugar')
const xtend = require('./xtend')

;['map', 'filter', 'find'].map(fname => {
  const suite = new Benchmark.Suite

  const obj = { a: { b: [1, 2, 3] }, c: null }
  const fn = v => v && v.b && v.b[1]
  const reduce_fn = (acc, v, k) =>  {
    acc.push(v && v.b && v.b[1] || k)
    return acc
  }
  const args = ({
    map: [obj, fn],
    reduce: [obj, reduce_fn, []],
    filter: [obj, fn],
    find: [obj, fn],
  })[fname]
  const stringify = arg => typeof arg === 'function' ? arg.toString() : JSON.stringify(arg)

  // console.log('params: (' + args.map(stringify).join(', ') + ')')
  ;['sugar', 'lodash', 'xtend'].map(libname => {
    const libfn = ({
      lodash: _,
      sugar: Sugar.Object,
      xtend: xtend.Object,
    })[libname][fname]

    // console.log(libname + '#' + fname, libfn(...args))
    suite.add(libname + '#' + fname, () => libfn(...args))
  })

  // green: '\x1b[32m', yellow: '\x1b[33m', reset: '\x1b[0m'
  const start = txt => console.log('\x1b[32m', txt, '\x1b[0m')
  const complete = txt => console.log('\x1b[33m', txt, '\x1b[0m', '\n')
  suite
    .on('start', ev => start('Starting "' + fname + '" Test Suite'))
    .on('cycle', ev => console.log(String(ev.target)))
    .on('complete', () => complete('The fastest is ' + suite.filter('fastest').map('name')))
    .run()
})
