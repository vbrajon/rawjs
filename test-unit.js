const test = require('tape')
const xtend = require('./xtend')

test('it works without extending', t => {
  t.equal(xtend.version.slice(0, 1), '1')
  t.true(same({ a: 1 }, { a: 1 })) // directly extend context with is & same
  t.same(xtend.Array.flat([[[4]], [2, 3], [1]]), [[4], 2, 3, 1]) // recursive
  t.same(xtend.Array.flat([[[4]], [2, 3], [1]], Infinity), [4, 2, 3, 1]) // with argument
  t.end()
})

test('it extends primitive prototypes', t => {
  t.false(typeof {}.map === 'function')
  xtend()
  t.true(typeof {}.map === 'function')
  xtend.Object.custom = x => 1
  t.false(typeof {}.custom === 'function')
  xtend()
  t.true(typeof {}.custom === 'function')
  delete Object.prototype.custom
  t.false(typeof {}.custom === 'function')
  Object.prototype.custom = x => 1
  t.true(typeof {}.custom === 'function')
  // t.true(typeof ''.map === 'undefined')
  t.end()
})

test('it extends Object # map, reduce, filter, find', t => {
  const obj = { a: 1, b: 2 }
  t.same(obj.map(v => v * 2), { a: 2, b: 4 })
  t.same(
    obj.reduce((acc, v, k, i) => {
      acc.push(k + v * 2 + i)
      return acc
    }, []),
    ['a20', 'b41'],
  )
  t.same(obj.filter((v, k) => k === 'b'), { b: 2 })
  t.same(obj.find(v => v === 2), 'b')
  t.end()
})

test('it extends Array # group, sort, flat, unique', t => {
  const arr = [[[4]], [2, 3], [1]]
  t.same(arr.group('length'), { 1: [[[4]], [1]], 2: [[2, 3]] })
  t.same(arr.sort(), [[1], [2, 3], [[4]]])
  t.same(arr.sort('length'), [[[4]], [1], [2, 3]])
  t.same(arr.sort(v => v.length), [[[4]], [1], [2, 3]])
  t.same(arr.sort((a, b) => (a.length === b.length ? 0 : a.length > b.length ? 1 : -1)), [[[4]], [1], [2, 3]])
  t.same(arr.sort(0), [[1], [2, 3], [[4]]])
  t.same(arr.flat(Infinity), [4, 2, 3, 1])
  t.same(arr.flat(1), [[4], 2, 3, 1])
  t.same([1, 1, 2, 2, 3].unique(), [1, 2, 3])
  t.same(arr.first(), [[4]])
  t.same(arr.last(), [1])
  const list = [{ lastname: 'John', age: 24 }, { lastname: 'Jane', age: 34 }, { lastname: 'John', age: 20 }]
  const tupple = [['John', 24], ['Jane', 34], ['John', 20]]
  t.same(list.sort(['-lastname', 'age']), [{ lastname: 'John', age: 20 }, { lastname: 'John', age: 24 }, { lastname: 'Jane', age: 34 }])
  t.same(tupple.sort(['-0', '1']), [['John', 20], ['John', 24], ['Jane', 34]])
  t.same([1, 0, undefined, null, 2].filter(), [1, 2])
  t.same(list.filter({ lastname: 'John' }), {})
  // t.same(list.filter({ lastname: ['John', 'Jane'] }), list)
  t.same(list.filter({ age: '>28' }), {})
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
  t.equal(
    str
      .words()
      .map('lower.capitalize')
      .join(''),
    'IAmThe1AndLonely',
  )
  t.equal(str.join().capitalize(), 'I am the 1 and lonely') // Human
  t.equal(str.join('-'), 'i-am-the-1-and-lonely') // kebab case | list case | dash
  t.equal(str.join('_'), 'i_am_the_1_and_lonely') // snake case | underscore
  t.equal(str.join('', 'lower.capitalize'), 'IAmThe1AndLonely') // pascal case
  t.equal(str.join('', 'lower.capitalize').replace(/./, c => c.toLowerCase()), 'iAmThe1AndLonely') // camel case
  t.end()
})

test('it extends Function # debounce, throttle', t => {
  t.plan(3)
  const debounce = (() => t.true(true)).debounce(50)
  const throttle = (() => t.true(true)).throttle(50)
  Array(15)
    .fill(0)
    .map((_, i) =>
      setTimeout(() => {
        debounce()
        throttle()
      }, i * 5),
    )
  setTimeout(t.end, 200)
})

test('it works with shorthand', t => {
  const obj = { a: [1, 2], b: [3, 4] }
  t.same(obj.map(), obj.map(x => x)) // clone
  t.same(obj.map(1), obj.map(x => x[1]))
  t.same(obj.map('length'), obj.map(x => x.length))
  t.same(obj.filter(), obj.filter(x => x))
  t.same(obj.find([3, 4]), 'b')

  const arr = [{ a: 1, b: 2 }, { b: 3, c: 4 }]
  t.same(arr.map(), arr) // clone
  t.same(arr.filter('c'), [{ b: 3, c: 4 }])
  t.same([null, 'a', undefined].filter(), ['a'])
  t.same([{ a: { b: 'one' } }, { a: { b: 'two' } }].map('a.b'), ['one', 'two'])
  t.same([{ a: { b: 'one' } }, { a: { b: 'two' } }].map('a.b.lower.capitalize'), ['One', 'Two'])
  t.end()
})

test('it exposes is(a, b) and same(a, b)', t => {
  t.true(same({ a: { b: [1, 2, new Date('2018-01-01')] } }, { a: { b: [1, 2, new Date('2018-01-01')] } }))
  // Preferred syntax > is(a, b) where 'a' is a Constructor
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
  // Edge cases: only native Primitives are compared
  t.true(is(Function, class A {}))
  t.true(is(Object, new class A {}()))
  // Deprecated syntax > is(a, b) where 'a' and 'b' are both values
  t.true(is(true, false)) // Both Booleans
  t.true(is(x => x, function() {}))
  t.true(is([1], [2]))
  t.true(is('a', 'b'))
  t.true(is(/regex/, /o/))
  t.false(is(Number, NaN)) // Both Numbers according to JS
  t.false(is(Number, Infinity)) // Attempt to replace isNaN / isFinite
  // Alternative syntax > is(a) === 'type'
  t.true(is(null) === 'null')
  t.true(is(undefined) === 'undefined')
  t.true(is(true) === 'boolean')
  t.true(is(0.1) === 'number')
  t.true(is(NaN) === 'nan')
  t.true(is(Infinity) === 'infinity')
  t.true(is('0') === 'string')
  t.true(is({}) === 'object')
  t.true(is([]) === 'array')
  t.true(is(x => x) === 'function')
  t.true(is(Boolean) === 'boolean')
  t.true(is(Number) === 'number')
  t.true(is(String) === 'string')
  t.true(is(Object) === 'object')
  t.true(is(Array) === 'array')
  t.true(is(Function) === 'function')
  t.true(is(Date) === 'date')
  t.true(is(RegExp) === 'regexp')
  t.true(is(/regx/) === 'regexp')
  t.true(is(new Date()) === 'date')
  t.end()
})
