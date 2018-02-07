const test = require('tape')
const xtend = require('./xtend')
xtend()

test('it extends map, reduce, filter, find on object', t => {
  t.equal(typeof ({}).map, 'function')
  t.same(({ a: 1, b: 2 }).map(v => v * 2), { a: 2, b: 4 })
  t.same(({ a: 1, b: 2 }).reduce((acc, v, k, i) => { acc.push(k + v * 2 + i);return acc }, []), ['a20', 'b41'])
  t.same(({ a: 1, b: 2 }).filter((v, k) => k === 'b'), { b: 2 })
  t.same(({ a: 1, b: 2 }).find(v => v === 2), 'b')
  t.end()
})

test('it extends first, last on array', t => {
  t.equal(typeof ({}).map, 'function')
  t.same(['a', 'b'].first(), 'a')
  t.same(['a', 'b'].last(), 'b')
  t.end()
})

test('it works with shorthand', t => {
  t.end()
})

test('it can be extended', t => {
  t.end()
})
