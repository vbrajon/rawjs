const Benchmark = require('benchmark')
const suite = new Benchmark.Suite

const _ = require('lodash')
const Sugar = require('Sugar')
const xtend = require('./xtend')

const obj = { a: { b: [1, 2, 3] }, c: null }
const fn = v => v && v.b && v.b[1]
const reduce_fn = (acc, v, k) =>  {
  acc.push(v && v.b && v.b[1] || k)
  return acc
}

console.log('map')
console.log(_.map(obj, fn))
console.log(Sugar.Object.map(obj, fn))
console.log(xtend.Object.map(obj, fn))

console.log('filter')
console.log(_.filter(obj, fn))
console.log(Sugar.Object.filter(obj, fn))
console.log(xtend.Object.filter(obj, fn))

console.log('find')
console.log(_.find(obj, fn))
console.log(Sugar.Object.find(obj, fn))
console.log(xtend.Object.find(obj, fn))

console.log('reduce')
console.log(_.reduce(obj, reduce_fn, []))
console.log(Sugar.Object.reduce(obj, reduce_fn, []))
console.log(xtend.Object.reduce(obj, reduce_fn, []))

suite.add('lodash', function() {
  _.map(obj, fn)
  _.filter(obj, fn)
  _.find(obj, fn)
  _.reduce(obj, reduce_fn, [])
})

suite.add('sugar', function() {
  Sugar.Object.map(obj, fn)
  Sugar.Object.filter(obj, fn)
  Sugar.Object.find(obj, fn)
  Sugar.Object.reduce(obj, reduce_fn, [])
})

suite.add('xtend', function() {
  xtend.Object.map(obj, fn)
  xtend.Object.filter(obj, fn)
  xtend.Object.find(obj, fn)
  xtend.Object.reduce(obj, reduce_fn, [])
})


suite
  .on('cycle', ev => console.log(String(ev.target)))
  .on('complete', () => console.log('The fastest is ' + suite.filter('fastest').map('name')))
  .run({ async: true })
