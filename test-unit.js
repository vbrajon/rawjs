const test = require('tape')
const xtend = require('./xtend')

test('it works without extending', t => {
  t.same(xtend.Array.flatten([[[4]], [2, 3], [1]]), [4, 2, 3, 1]) // recursive
  t.same(xtend.Array.flatten([[[4]], [2, 3], [1]], 1), [[4], 2, 3, 1]) // with argument
  t.end()
})

test('it extends primitive prototypes', t => {
  t.equal(xtend.version.slice(0, 1), '1')
  t.true(typeof same === 'function') // directly extend context with is/same

  t.false(typeof ({}).map === 'function')
  xtend()
  t.true(typeof ({}).map === 'function')

  xtend.Object.custom = x => x
  t.false(typeof ({}).custom === 'function')
  xtend()
  t.true(typeof ({}).custom === 'function')
  delete Object.prototype.custom
  t.false(typeof ({}).custom === 'function')

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
  const arr = [[[4]], [2, 3], [1]]
  t.same(arr.groupBy('length'), { 1: [[[4]], [1]], 2: [[2, 3]] })
  t.same(arr.sortBy('length'), [[[4]], [1], [2, 3]])
  t.same(arr.sortBy(v => v.length), [[[4]], [1], [2, 3]])
  t.same(arr.sortBy((a, b) => a.length === b.length ? 0 : a.length > b.length ? 1 : -1), [[[4]], [1], [2, 3]])
  t.same(arr.sortBy(0), [[1], [2, 3], [[4]]])
  t.same(arr.flatten(), [4, 2, 3, 1])
  t.same(arr.flatten(1), [[4], 2, 3, 1])
  t.same([1, 1, 2, 2, 3].unique(), [1, 2, 3])
  t.same(arr.first(), [[4]])
  t.same(arr.last(), [1])
  t.same([{ lastname: 'John', age: 24 }, { lastname: 'Jane', age: 34 }, { lastname: 'John', age: 20 }].sortBy(['-lastname', 'age']), [{ lastname: 'John', age: 20 }, { lastname: 'John', age: 24 }, { lastname: 'Jane', age: 34 }])
  t.same([['John', 24], ['Jane', 34], ['John', 20]].sortBy(['-0', '1']), [['John', 20], ['John', 24], ['Jane', 34]])
  t.end()
})

test('it extends String # format, join', t => {
  t.equal('{}{}{}'.format('a', 'b'), 'ab{}')
  t.equal('{1}{2}{0}{1}'.format('a', 'b'), 'b{2}ab')
  t.equal('{k2}{k2}{k3}'.format({ k1: 'a', k2: 'b' }), 'bb{k3}')
  t.equal('{1}{0}{}{1}'.format('a', 'b'), 'baab')
  const str = 'i amThe,\t1:\nAnd_L?on*e%ly.'
  t.same(str.words(), ['i', 'am', 'The', '1', 'And', 'Lonely'])
  t.same(str.words(false), ['i', 'am', 'The,', '1:', 'And', 'L?on*e%ly.'])
  t.equal(str.words().map('lower.capitalize').join(''), 'IAmThe1AndLonely')
  t.equal(str.join().capitalize(), 'I am the 1 and lonely') // Human
  t.equal(str.join('-'), 'i-am-the-1-and-lonely') // kebab case | list case | dash
  t.equal(str.join('_'), 'i_am_the_1_and_lonely') // snake case | underscore
  t.equal(str.join('', 'lower.capitalize'), 'IAmThe1AndLonely') // pascal case
  t.equal(str.join('', 'lower.capitalize').replace(/./, c => c.toLowerCase()), 'iAmThe1AndLonely') // camel case
  t.end()
})

test('it works with shorthand', t => {
  const obj = { a: [1, 2], b: [3, 4] }
  t.same(obj.map(), obj.map(x => x)) // clone
  t.same(obj.map(1), obj.map(x => x[1]))
  t.same(obj.map('length'), obj.map(x => x.length))
  t.same(obj.filter(), obj.filter(x => x))
  t.same(obj.find([3, 4]), 'b')

  const arr = [{ a: 1, b: 2}, { b: 3, c: 4}]
  t.same(arr.map(), arr) // clone
  t.same(arr.filter('c'), [{ b: 3, c: 4}])
  t.same([null, 'a', undefined].filter(), ['a'])
  t.same([{ a: { b: 'one' }}, { a: { b: 'two' }}].map('a.b'), ['one', 'two'])
  t.same([{ a: { b: 'one' }}, { a: { b: 'two' }}].map('a.b.lower.capitalize'), ['One', 'Two'])
  t.end()
})

test('it exposes same(a, b) or [].same(b) or ({}).same(b)', t => {
  t.true(same({ a: { b: [1, 2, new Date('2018-01-01')] } }, { a: { b: [1, 2, new Date('2018-01-01')] } }))
  t.end()
})

test('it exposes is(a, b) or is(a) === "type"', t => {
  // is(a, b) > preferred syntax
  t.true(is(null, null))
  t.true(is(undefined, undefined))
  t.true(is(NaN, NaN))
  t.true(is(Infinity, Infinity))
  t.true(is(Boolean, false))
  t.true(is(Number, 1))
  t.true(is(String, ''))
  t.true(is(Object, {}))
  t.true(is(Array, []))
  t.true(is(RegExp, /regex/))
  t.true(is(Function, x => x))
  t.true(is(Date, new Date()))
  t.true(is('a', 'b'))
  t.true(is([1], [2]))
  t.true(is(/regex/, /o/))
  t.true(is(x => x, function() {}))

  // NOTE: is(a, b) compare the type of both operands
  t.true(is(true, false)) // Both Booleans
  t.false(is(Number, NaN)) // Both Numbers according to JS
  t.false(is(Number, Infinity)) // Attempt to replace isNaN / isFinite
  // Prefer Constructor instead of string, the following edge cases are intended
  t.false(is(null, 'null'))
  t.false(is(Object, 'object'))
  t.false(is(Function, 'function'))
  t.true(is(String, 'string'))
  t.true(is(Function, class A {}))
  t.true(is(Object, new (class A {})()))

  // is(a) === 'type'
  t.equal(is(null), 'null')
  t.equal(is(undefined), 'undefined')
  t.equal(is(true), 'boolean')
  t.equal(is(.1), 'number')
  t.equal(is(NaN), 'nan')
  t.equal(is(Infinity), 'infinity')
  t.equal(is('0'), 'string')
  t.equal(is({}), 'object')
  t.equal(is([]), 'array')
  t.equal(is(x => x), 'function')
  t.equal(is(Boolean), 'boolean')
  t.equal(is(Number), 'number')
  t.equal(is(String), 'string')
  t.equal(is(Object), 'object')
  t.equal(is(Array), 'array')
  t.equal(is(Function), 'function')
  t.equal(is(Date), 'date')
  t.equal(is(RegExp), 'regexp')
  t.equal(is(/regx/), 'regexp')
  t.equal(is(new Date()), 'date')

  t.end()
})
