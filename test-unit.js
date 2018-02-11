const test = require('tape')
const xtend = require('./xtend')

test('it extends primitive prototypes and global ctx', t => {
  t.equal(xtend.version.slice(0, 1), '1')
  t.false(typeof same === 'function')
  t.false(typeof ({}).map === 'function')
  t.false(typeof ({}).keys === 'function')
  t.false(typeof ({}).custom_extend === 'function')
  delete xtend.Object.keys // function will not be extended
  xtend.Object.custom_extend = x => x // custom function, also work with
  xtend()
  t.true(typeof ({}).map === 'function')
  t.true(typeof same === 'function')
  t.false(typeof ({}).keys === 'function')
  t.true(typeof ({}).custom_extend === 'function')
  xtend.Object.custom_extend_second_call = x => x
  xtend()
  t.true(typeof ({}).custom_extend_second_call === 'function')
  t.end()
})

test('it extends Object # map, reduce, filter, find', t => {
  const obj = { a: 1, b: 2 }
  t.same(obj.map(v => v * 2), { a: 2, b: 4 })
  t.same(obj.reduce((acc, v, k, i) => { acc.push(k + v * 2 + i);return acc }, []), ['a20', 'b41'])
  t.same(obj.filter((v, k) => k === 'b'), { b: 2 })
  t.same(obj.find(v => v === 2), 'b')
  t.end()
})

test('it extends Array # groupBy, sortBy, flatten, unique', t => {
  const arr = [[1], [2, 3], [[4]]]
  t.same(arr.groupBy('length'), { 1: [[1], [[4]]], 2: [[2, 3]] })
  t.same(arr.sortBy('length'), [[1], [[4]], [2, 3]])
  t.same(arr.sortBy((a, b) => a.length > b.length), [[1], [[4]], [2, 3]])
  t.same(arr.flatten(), [1, 2, 3, 4])
  t.same(arr.flatten(1), [1, 2, 3, [4]])
  t.same([1, 1, 2, 2, 3].unique(), [1, 2, 3])
  t.same(arr.first(), [1])
  t.same(arr.last(), [[4]])
  t.end()
})

test('it extends String # format, capitalize, titleize', t => {
  t.equal('{}{}{}'.format('a', 'b'), 'ab{}')
  t.equal('{1}{2}{0}{1}'.format('a', 'b'), 'b{2}ab')
  t.equal('{k2}{k2}{k3}'.format({ k1: 'a', k2: 'b' }), 'bb{k3}')
  t.equal('{1}{0}{}{1}'.format('a', 'b'), 'baab')
  t.equal('i-AM_The, OnE: And oNLy.'.capitalize(), 'I-am_the, one: and only.')
  t.equal('i-AM_The, OnE: And oNLy.'.titleize(), 'I Am The One And Only')
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
  t.same(obj.reduce((_, v, k) => ({ [v[0]]: k }), []), [{ 1: 'a' }, { 3: 'b' }])

  const arr = [{ a: 1, b: 2}, { b: 3, c: 4}]
  t.same(arr.map(), arr) // clone
  t.same(arr.filter('c'), [{ b: 3, c: 4}])
  t.same([null, 'a', undefined].filter(), ['a'])
  t.end()
})

test('it exposes same(a, b) or [].same(b) or ({}).same(b)', t => {
  t.true(same({ a: { b: [1, 2, new Date('2018-01-01')] } }, { a: { b: [1, 2, new Date('2018-01-01')] } }))
  t.true([[{ a: 1 }]].same([[{ a: 1 }]]))
  t.true(({ a: [[1]] }).same({ a: [[1]] }))
  t.false([{}, null].same([{}]))
  t.end()
})

test('it exposes is(a, b) or is(a) === "type"', t => {
  // is(a) === 'type'
  t.true(is(null) === 'null')
  t.true(is(undefined) === 'undefined')
  t.true(is(true) === 'boolean')
  t.true(is(.1) === 'number')
  t.true(is('0') === 'string')
  t.true(is({}) === 'object')
  t.true(is([]) === 'array')
  t.true(is(x => x) === 'function')
  t.true(is(Object) === 'object')
  t.true(is(Array) === 'array')
  t.true(is(Function) === 'function')
  t.true(is(Date) === 'date')
  t.true(is(RegExp) === 'regexp')
  t.true(is(/regx/) === 'regexp')
  t.true(is(new Date()) === 'date')

  // is(a, b)
  t.true(is({}, Object))
  t.true(is([1], [2]))
  t.true(is(/regx/, RegExp))
  t.true(is(/regx/, /a/))
  t.true(is(x => x, Function))

  // NOTE: is(a, b) will compare the type of both operands
  // Prefer Constructor instead of string, wanted edge cases
  t.false(is({}, 'object'))
  t.false(is(Date, 'date'))
  t.false(is('date', new Date()))
  t.true(is('aze', 'string'))

  // FIXME: unwanted edge cases, should be true
  t.false(is(function() {}) === 'function')
  t.false(is(function bliblablu() {}) === 'function')
  t.false(is(x => x, function() {}))

  t.end()
})
