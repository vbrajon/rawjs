const test = require('tape')
const xtend = require('./xtend')

test('it works without extending', t => {
  t.equal(xtend.version.slice(0, 1), '1')
  t.same(xtend.Object.map({ a: 1, b: 2 }, (v, k) => k + v), { a: 'a1', b: 'b2' })
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

test('it extends Object # map, reduce, filter, find, keys, values, entries, assign', t => {
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

test('it extends Array # group, sort, unique, first, last, min, max, sum, average, median', t => {
  const arr = [[[4]], [2, 3], [1]]
  t.same(arr.group('length'), { 1: [[[4]], [1]], 2: [[2, 3]] })
  t.same(arr.sort(), [[1], [2, 3], [[4]]])
  t.same(arr.sort('length'), [[[4]], [1], [2, 3]])
  t.same(arr.sort(v => v.length), [[[4]], [1], [2, 3]])
  t.same(arr.sort((a, b) => (a.length === b.length ? 0 : a.length > b.length ? 1 : -1)), [[[4]], [1], [2, 3]])
  t.same(arr.sort(0), [[1], [2, 3], [[4]]])
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

test('it extends Function # debounce, throttle, delay, every, cancel, memoize, partial', t => {
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

test('it extends String # format, words, join, lower, upper, capitalize', t => {
  t.equal('{}{}{}'.format('a', 'b'), 'ab{}')
  t.equal('{1}{2}{0}{1}'.format('a', 'b'), 'b{2}ab')
  t.equal('{k2}{k2}{k3}'.format({ k1: 'a', k2: 'b' }), 'bb{k3}')
  t.equal('{1}{0}{}{1}'.format('a', 'b'), 'baab')
  const str = 'i am: The\t1\nAND,_L?on*e%ly.'
  t.same(str.words(), ['i', 'am', 'The', '1', 'AND', 'Lonely'])
  t.same(str.words(false), ['i', 'am:', 'The', '1', 'AND,', 'L?on*e%ly.'])
  // t.equal(str.join('title'), 'I am: the 1 and Lonely.') // Title
  t.equal(str.join('human'), 'I am the 1 and lonely') // Human
  t.equal(str.join('-'), 'i-am-the-1-and-lonely') // kebab case | list case | dash
  t.equal(str.join('_'), 'i_am_the_1_and_lonely') // snake case | underscore
  t.equal(str.join('camel'), 'iAmThe1AndLonely') // camel case
  t.equal(str.join('pascal'), 'IAmThe1AndLonely') // pascal case
  t.end()
})

test('it extends Number # format, [math], duration', t => {})
test('it extends Date # format, locale, add, sub, iso, relative', t => {})

test('it works with shorthand', t => {
  const obj = { a: [1, 2], b: [3, 4] }
  t.same(obj.map(), obj.map(x => x)) // clone
  t.same(obj.map(1), obj.map(x => x[1]))
  t.same(obj.map('length'), obj.map(x => x.length))
  t.same(obj.filter(), obj.filter(x => x))
  t.same(obj.find([3, 4]), 'b')

  const arr = [{ a: 1, b: 2 }, { b: 3, c: 4 }]
  t.same(arr.map(), arr.slice()) // clone
  t.same(arr.filter('c'), [{ b: 3, c: 4 }])
  t.same([null, 'a', undefined].filter(), ['a'])
  t.same([{ a: { b: 'one' } }, { a: { b: 'two' } }].map('a.b'), ['one', 'two'])
  t.same([{ a: { b: 'one' } }, { a: { b: 'two' } }].map('a.b.lower.capitalize'), ['One', 'Two'])
  t.end()
})
