const test = require('tape')
const xtend = require('./xtend')

test('it extends primitive prototypes', t => {
  xtend()
  const obj = {}
  const arr = []
  t.equal(arr.map, Array.prototype.map)
  t.equal(obj.map, Object.prototype.map)
  t.equal(typeof obj.map, 'function')
  t.equal(typeof obj.extendkey, 'undefined')
  xtend.Object.extendkey = o => o
  xtend()
  t.equal(typeof obj.extendkey, 'function')
  t.end()
})

test('it extends map, reduce, filter, find on object', t => {
  const obj = { a: 1, b: 2 }
  t.same(obj.map(v => v * 2), { a: 2, b: 4 })
  t.same(obj.reduce((acc, v, k, i) => { acc.push(k + v * 2 + i);return acc }, []), ['a20', 'b41'])
  t.same(obj.filter((v, k) => k === 'b'), { b: 2 })
  t.same(obj.find(v => v === 2), 'b')
  t.end()
})

test('it extends first, last on array', t => {
  const arr = ['a', 'b']
  t.same(arr.first(), 'a')
  t.same(arr.last(), 'b')
  t.end()
})

test('it works with shorthand', t => {
  const obj = { a: [1, 2], b: [3, 4] }
  t.same(obj.map(), obj.map(x => x)) // clone
  t.same(obj.map(1), obj.map(x => x[1]))
  t.same(obj.map('length'), obj.map(x => x.length))
  t.same(obj.filter(), obj.map(x => x))
  t.same(obj.find([3, 4]), 'b')
  t.same(obj.find(v => v.same([3, 4])), 'b')
  t.same(obj.reduce(1, []), [2, 4])
  t.same(obj.reduce(v => v[1], []), obj.reduce((acc, v, k) => { acc.push(v[1]);return acc }, []))
  t.same(obj.reduce((v, k) => ({ [v[0]]: k }), []), [{ 1: 'a' }, { 3: 'b' }])

  const arr = [{ a: 1, b: 2}, { b: 3, c: 4}]
  t.same(arr.map(), arr) // clone
  t.same(arr.filter('c'), [{ b: 3, c: 4}])
  t.same([null, 'a', undefined].filter(), ['a'])
  t.end()
})

test('it exposes xtend.same(a, b) or [].same(b) or ({}).same(b)', t => {
  t.true(xtend.same({ a: { b: [1, 2, new Date('2018-01-01')] } }, { a: { b: [1, 2, new Date('2018-01-01')] } }))
  t.true([{ a: 1 }].same([{ a: 1 }]))
  t.end()
})
