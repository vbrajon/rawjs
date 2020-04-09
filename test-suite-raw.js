import './raw.js'
arr = [{ name: 'Jane Doe', age: 22 }, { name: 'John Doe', age: 29, birthdate: new Date('1989-11-14') }, { name: 'Janette Doe', age: 22 }, { name: 'Johnny Doe', age: 71, birthdate: new Date('Feb 26, 1932') }]
obj = arr[0]
str = 'i am: The1\nAND\t,_L?on*e%ly.'
date = new Date('2019-01-20T10:09:08')

// ['Object.map#shortcut', 'Object.reduce', 'Object.filter#shortcut', 'Object.find#shortcut', 'Object.eq', 'Object.access', 'Object.extend#core', 'Object.keys', 'Object.values', 'Array.group', 'Array.unique', 'Array.min', 'Array.max', 'Array.sum', 'Array.mean', 'Array.median', 'Array.map#native#shortcut', 'Array.reduce#native', 'Array.filter#native#shortcut', 'Array.find#native#shortcut', 'Array.findIndex#native#shortcut', 'Array.sort#native#shortcut', 'Array.reverse#native', 'Function.wrap', 'Function.partial', 'Function.every', 'Function.wait', 'Function.debounce', 'Function.throttle', 'Function.memoize', 'String.format#shortcut', 'String.lower', 'String.upper', 'String.capitalize', 'String.words', 'String.join', 'Number.duration', 'Number.format#shortcut', 'Number.abs', 'Number.acos', 'Number.acosh', 'Number.asin', 'Number.asinh', 'Number.atan', 'Number.atanh', 'Number.atan2', 'Number.ceil', 'Number.cbrt', 'Number.expm1', 'Number.clz32', 'Number.cos', 'Number.cosh', 'Number.exp', 'Number.floor', 'Number.fround', 'Number.hypot', 'Number.imul', 'Number.log', 'Number.log1p', 'Number.log2', 'Number.log10', 'Number.max', 'Number.min', 'Number.pow', 'Number.random', 'Number.round', 'Number.sign', 'Number.sin', 'Number.sinh', 'Number.sqrt', 'Number.tan', 'Number.tanh', 'Number.trunc', 'Date.relative', 'Date.getWeek', 'Date.getQuarter', 'Date.getLastDate', 'Date.format#shortcut', 'Date.modify', 'Date.plus', 'Date.minus', 'Date.start', 'Date.end', 'RegExp.escape', 'RegExp.plus', 'RegExp.minus'] //
Object.extend(true)

// [ 'name', 'age' ] //
obj.keys()

// [ 'Jane Doe', 22 ] //
obj.values()

// { name: 'Jane Doe', age: 44 } //
obj.map(v => v * 2 || v)

// 'age' //
obj.find(22)

// { age: 22 } //
obj.filter(Number)

// { 'Jane Doe': 'name', 22: 'age' } //
obj.reduce((acc, v, k) => (acc[v] = k, acc), {})

// [null, 'a', undefined, /a/] //
[null, 'a', undefined, /a/].map()

// ['a', /a/] //
[null, 'a', undefined, /a/].filter()

// ['Jane Doe', 'Janette Doe', 'John Doe', 'Johnny Doe'] //
arr.map('name').sort()

// ['Jane Doe', 'Janette Doe'] //
arr.map('name').filter(/Ja/)

// arr //
arr.filter('name')

// arr //
arr.group(d => !!d.name)[true]

// { name: 'Jane Doe', age: 22 } //
arr.find({ name: /Ja/ })

// arr.sort('age').map('age') //
arr.sort(d => d.age).map(d => d.age)

// [[null, 1], [null, 2], [1, 3], [null, 4]].sort((a, b) => a[0] > b[0] ? -1 : 1) //
[[null, 1], [null, 2], [1, 3], [null, 4]].sort((a, b) => a[0] > b[0] ? -1 : 1).sort((a, b) => a[0] > b[0] ? -1 : 1)

// [[null, 1], [null, 2], [1, 3], [null, 4]].sort([0]) //
[[null, 1], [null, 2], [1, 3], [null, 4]].sort([0]).sort([0])

// [[71, 'Johnny Doe'], [29, 'John Doe'], [22, 'Jane Doe'], [22, 'Janette Doe']] //
arr.sort(['-age', 'name']).map(d => [d.age, d.name])

// { 22: ['Jane Doe', 'Janette Doe'], 29: ['John Doe'], 71: ['Johnny Doe'] } //
arr.group('age').map(g => g.map('name'))

// { '22,Jane Doe': 1, '22,Janette Doe': 1, '29,John Doe': 1, '71,Johnny Doe': 1 } //
arr.group(['age', 'name']).map(g => g.length)

// [22, 29, 71] //
arr.map('age').unique()

// 144 //
arr.map('age').sum()

// 22 //
arr.map('age').min()

// 71 //
arr.map('age').max()

// 36 //
arr.map('age').mean()

// 25.5 //
arr.map('age').median()

// ['One', 'Two'] //
[{ a: { b: 'one' } }, { a: { b: 'two' } }].map('a.b.capitalize')

// [1, 2] //
((a, b) => [a, b]).partial(null, 2)(1)

// 1 //
(x => x).wrap((fn, x) => fn(x / 2) / 2)(4)

// 1 //
const mem = (x => x / 2).memoize()
mem(2)
mem(2)
mem.cache['[2]']

// ['i', 'am', 'The', '1', 'AND', 'Lonely'] //
str.words()

// 'i am The 1 AND Lonely' //
str.join()

// 'I Am The 1 And Lonely' //
str.join('title')

// 'i-am-The-1-AND-Lonely' //
str.join('-')

// 'i-am-the-1-and-lonely' //
str.join('dash')

// 'i_am_the_1_and_lonely' //
str.join('underscore')

// 'iAmThe1AndLonely' //
str.join('camel')

// 'IAmThe1AndLonely' //
str.join('pascal')

// 'ab' //
'{}{}{}'.format('a', 'b')

// 'ab' //
'{}{}{}'.format(['a', 'b'])

// 'bbbaa' //
'{1}{1}{1}{0}{0}'.format('a', 'b')

// 'bb' //
'{2}{2}{2}{1}{1}'.format(['a', 'b', ''])

// 'abbbbaa' //
'{}{}{}{1}{1}{1}{0}{0}'.format('a', 'b')

// 'bb' //
'{k2}{k2}{k3}'.format({ k1: 'a', k2: 'b' })

// '66 pears x 4 apples' //
'{66} pears x {3} apples'.format((x, i) => +x + i)

// 300 //
(.1 * 3 * 1000).format()

// '-100µ' //
(-.000123456789).format(1)

// '120G' //
(123456789000).format(2)

// '1,010.01' //
(1010.01010).format('en')

// '1 010,01' //
(1010.01010).format('fr')

// 3 //
(3.1415).floor()

// -1 //
Math.PI.cos()

// 9 //
(3).pow(2)

// '-10 hours' //
(-36666666).duration()

// '12 seconds ago' //
date.minus('12 seconds').relative(date)

// '2019-01-20' //
date.format()

// '20/01/2019 10h09m' //
date.format('DD/MM/YYYY hhhmmm')

// 'Q1 W3' //
date.format('QQ WW')

// '20 janvier 2019' //
date.format('day, month, year', 'fr')

// 'Sunday, January 20, 10:09:08 AM' //
date.format('month, day, weekday, hour, minute, second')

// '2019-01-21' //
date.plus('day').format()

// 8 //
Date.getWeek(new Date('2015-02-26'))

// 9 //
Date.getWeek(new Date('2018-02-26'))

// 2 //
Date.getQuarter(new Date('2018-04-01'))

// '2019-01-01T08:12:00' //
new Date('2019-01-01').plus(.1 * 3 + ' day').format('YYYY-MM-DDThh:mm:ss')

// '2019-02-28' //
new Date('2019-05-31').minus('3 month').format()

// '2019-02-28' //
new Date('2019-05-31').plus('-3 month').format()

// '2019-02-28' //
new Date('2019-01-31').plus('1 Month').format()

// '2019-02-28' //
new Date('2019-01-31').minus('-1 month').format()

// '2017-02-28' //
new Date('2016-02-29').plus('1 year').format()

// '2016-12-31' //
new Date('2016-02-29').end('1 year').format()

// '2019-01-31' //
new Date('2018-12-31').plus('1 month').format()

// '2018-11-30' //
new Date('2018-12-31').minus('1 month').format()

// '2017-12-19T09:07:58' // DEPRECATED
date.minus('1 year, 1 month, 1 day, hour, minute and 10 seconds').format('YYYY-MM-DDThh:mm:ss')

// '2019-01-01T00:00:00' //
date.start('month').format('YYYY-MM-DDThh:mm:ss')

// '2019-12-31T23:59:59' //
date.end('year').format('YYYY-MM-DDThh:mm:ss')

// 'Sun (month: Jan), 10 AM' //
date.format('mon, wday, hour')

// '10:09:08' //
date.format('hour, minute, second')

// '-' //
new Date('Invalid').format('mon, wday, hour, minute')

// 'A.B' //
'a.b'.upper()

// 2 //
[1, 2, 3].median()

// '1 millisecond' //
(1).duration()

// '1' //
(1).format(10)

// '2 hours from now' //
new Date().plus('2 hours').relative()

// 'john@gmail\\.com' //
/john@gmail.com/.escape().source

// 'i' //
/QwErTy/.plus('i').flags

// '' //
/QwErTy/.minus('i').flags

// { a: { b: [1,2,3] }} //
({ a: { b: [1,2,3] }}).access()

// 3 //
({ a: { b: [1,2,3] }}).access('a.b.length')

// 3 //
([{ a: { b: [1,2,3] }}]).access('0.a.b.length')

// Object.access({ a: { 'b-c': 1 }}, "a['b-c']") //
({ a: { 'b-c': 1 }}).access('a.b-c')

// true //
Object.eq([undefined, null, { a: { b: /c/ }, c: [{ d: 1 }] }, [], x => x, /a/gi, new Date('2020'), '', '&', 'A', false, true, NaN, -Infinity, -1, -0, 0, 1, Infinity], [undefined, null, { a: { b: /c/ }, c: [{ d: 1 }] }, [], x => x, /a/gi, new Date('2020'), '', '&', 'A', false, true, NaN, -Infinity, -1, -0, 0, 1, Infinity])

// false //
Object.eq([null], [null, undefined])

// undefined //
Object.extend(Object, 'notdefined')

// { a: 1 } //
[{ a: 1 }].find({ a: 1 })

// { a: 1 } //
[{ a: 1 }].find([{ a: 1 }])

// { a: 2 } //
[{ a: 1 }, { a: 2 }].find({ a: [2, 3] })

// ['', '&', 'A', false, true, -Infinity, -1, -0, NaN, 0, 1, Infinity].shuffle().sort() //
Array.shuffle = (arr, r) => (arr.forEach((v, i) => ((r = Math.floor(Math.random() * i)), ([arr[i], arr[r]] = [arr[r], arr[i]]))), arr)
Object.extend()
['', '&', 'A', false, true, -Infinity, -1, -0, NaN, 0, 1, Infinity].sort()

// [undefined, null, x => x, /a/gi, '', '&', 'A', false, true, NaN, -Infinity, -1, -0, 0, 1, Infinity].shuffle().sort() //
[undefined, null, x => x, /a/gi, '', '&', 'A', false, true, NaN, -Infinity, -1, -0, 0, 1, Infinity].sort()

// { 22: { 'Jane Doe': 1, 'Janette Doe': 1 }, 29: { 'John Doe': 1 }, 71: { 'Johnny Doe': 1 } } //
Object.extend.group = (fn, ...args) => {
  if (args[1] instanceof Array) return args[0].reduce((acc, v) => {
    args[1].reduce((a, p, i, ds) => a[v[p]] = i === ds.length - 1 ? (a[v[p]] || []).concat([v]) : a[v[p]] || {}, acc)
    return acc
  }, {})
  return fn(...args)
}
Object.extend()
arr.group(['age', 'name']).map(g => g.map('length'))
