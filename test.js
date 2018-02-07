const test = require('tape')
const xtend = require('./xtend')
xtend()

test('it extends map, reduce, filter, find on object', t => {
  const obj = { a: 1, b: 2 }
  t.equal(typeof obj.map, 'function')
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
  const arr = [{ a: 1, b: 2}, { b: 3, c: 4}]
  t.same(obj.map('length'), obj.map(x => x.length))
  t.same(obj.map(1), obj.map(x => x[1]))
  // t.same(obj.map(), obj)
  // t.same(arr.map('b'), arr.map(x => x.b))
  t.end()
})

test('it can be extended', t => {
  t.end()
})
