import test from 'tape'
import raw from './raw'

test('it works without extending', t => {
  t.equal(raw.version.slice(0, 1), '1')
  t.same(Object.map({ a: 1, b: 2 }, (v, k) => k + v), { a: 'a1', b: 'b2' })
  t.end()
})

test('it extends primitive prototypes', t => {
  Object.custom = x => 1
  t.equal(typeof {}.custom, 'undefined')
  t.equal(typeof {}.map, 'undefined')
  raw()
  t.equal(typeof {}.custom, 'function')
  t.equal(typeof {}.map, 'function')
  delete Object.prototype.custom
  delete Object.custom
  t.equal(typeof {}.custom, 'undefined')
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

test('it extends Array # group, sort, unique, min, max, sum, average, median', t => {
  const arr = [[[4]], [2, 3], [1]]
  t.same(arr.sort(), [[1], [2, 3], [[4]]])
  t.same(arr.sort((a, b) => (a.length === b.length ? 0 : a.length > b.length ? 1 : -1)), [[[4]], [1], [2, 3]])
  t.same([1, 1, 2, 2, 3].unique(), [1, 2, 3])
  t.equal([4, 25, 1].min(), 1)
  t.equal([4, 25, 1].max(), 25)
  t.equal([4, 25, 1].median(), 4)
  t.equal([4, 25, 1].average(), 10)
  t.end()
})

test('it extends Function # debounce, throttle, delay, every, cancel, memoize, partial', t => {
  t.plan(5)
  const start = Date.now()
  const fn = name => t.true(true, `Function ${name} ran after ${Date.now() - start}ms`)
  const debounce = fn.partial('debounce').debounce(20) // called at the end (1 time)
  const throttle = fn.partial('throttle').throttle(20) // called every 20ms (3 times)
  const memoize = fn.partial('memoize').memoize() // called once, then return the cached result
  const loop = () => {
    // for i in {1..100};do silent node -r esm test-unit.js;echo $?;done
    // console.log(`Loop ran after ${Date.now() - start}ms`)
    debounce()
    throttle()
    memoize()
  }
  loop.every(5)
  loop.cancel.bind(loop).delay(55)
  t.end.delay(100)
})

test('it extends String # format, words, join, lower, upper, capitalize', t => {
  t.equal('{}{}{}'.format('a', 'b'), 'ab{}')
  t.equal('{1}{2}{0}{1}'.format('a', 'b'), 'b{2}ab')
  t.equal('{k2}{k2}{k3}'.format({ k1: 'a', k2: x => 'b' }), 'bb{k3}')
  t.equal('{1}{0}{}{1}'.format('a', 'b'), 'baab')
  t.equal('66 pears x 3 apples'.format({ [/\d+/]: x => x * 2 }), '132 pears x 6 apples')
  const str = 'i am: The\t1\nAND,_L?on*e%ly.'
  t.same(str.words(), ['i', 'am', 'The', '1', 'AND', 'Lonely'])
  t.same(str.words(false), ['i', 'am:', 'The', '1', 'AND,', 'L?on*e%ly.'])
  t.equal(str.join('title'), 'I Am The 1 And Lonely') // Titleize
  t.equal(str.join('-'), 'i-am-the-1-and-lonely') // kebab case | list case | dash
  t.equal(str.join('_'), 'i_am_the_1_and_lonely') // snake case | underscore
  t.equal(str.join('camel'), 'iAmThe1AndLonely') // camel case
  t.equal(str.join('pascal'), 'IAmThe1AndLonely') // pascal case
  t.end()
})

test('it extends Number # format, [math], duration', t => {
  t.equal((1010.0101).format(), '1,010.01')
  t.equal((1010.0101).format('fr'), '1 010,01')
  t.equal((3.1415).floor(), 3)
  t.equal(Math.PI.cos(), -1)
  t.equal((3).pow(2), 9)
  // t.equal((3666000).duration(), '1 hour')
  t.end()
})

test('it extends Date # format, plus, minus, start, end, relative', t => {
  const d = new Date('2019-03-11 00:10:10')
  t.equal(d.format(), '2019-03-11')
  t.equal(d.format('Dday, M+YY'), '11day, 3+19') // comma are accepted if followed by a space
  t.equal(d.format('DD/MM/YYYY'), '11/03/2019')
  t.equal(d.format('day,month,year'), 'March 11, 2019')
  t.equal(d.format('day,month,year', 'fr'), '11 mars 2019')
  t.equal(d.format('wday,day,mon'), 'Mon, Mar 11')
  t.equal(d.format('day,weekday,hour,minute,second'), '11 Monday, 12:10:10 AM')
  t.equal(d.format('weekday,wday,month,mon'), 'Monday (month: March)') // long format if both are specified
  t.equal(d.plus('day').format(), '2019-03-12')
  t.equal(d.minus('1 month, 2 days').format(), '2019-02-09')
  t.equal(d.start('month').toISOString(), '2019-02-28T23:00:00.000Z')
  t.equal(d.end('month').toISOString(), '2019-03-31T21:59:59.000Z')
  t.equal(
    d
      .plus('4month')
      .minus('3day')
      .start('minute')
      .toISOString(),
    '2019-07-07T22:10:00.000Z',
  )
  // t.equal(new Date().plus('14 days').relative(), '2 weeks from now')
  t.end()
})

test('it extends RegExp # escape, plus, minus', t => {
  t.same(/(parenthesis)/.escape().source, '\\(parenthesis\\)')
  t.same(/insensitive/.plus('i').flags, 'i')
  t.same(/sensitive/i.minus('i').flags, '')
  t.end()
})

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

  const nest = [[[4]], [2, 3], [1]]
  const list = [{ lastname: 'John', age: 24 }, { lastname: 'Jane', age: 34 }, { lastname: 'John', age: 20 }]
  const tupple = [['John', 24], ['Jane', 34], ['John', 20]]
  t.same(nest.group('length'), { 1: [[[4]], [1]], 2: [[2, 3]] })
  t.same(nest.sort('length'), [[[4]], [1], [2, 3]])
  t.same(nest.sort(v => v.length), [[[4]], [1], [2, 3]])
  t.same(nest.sort(0), [[1], [2, 3], [[4]]])
  t.same(list.sort(['-lastname', 'age']), [{ lastname: 'John', age: 20 }, { lastname: 'John', age: 24 }, { lastname: 'Jane', age: 34 }])
  t.same(tupple.sort(['-0', '1']), [['John', 20], ['John', 24], ['Jane', 34]])
  t.same([1, 0, undefined, null, 2].filter(), [1, 2])
  // t.same(list.filter({ lastname: ['John', 'Jane'] }), list)
  // t.same(list.filter({ age: '>28' }), [{ lastname: 'Jane', age: 34 }])
  // t.same(list.find({ lastname: 'John' }), { lastname: 'John', age: 24 })
})
