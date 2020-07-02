import './raw.js'
const arr = [{ name: 'Jane Doe', age: 22 }, { name: 'John Doe', age: 29, birthdate: new Date('1989-11-14') }, { name: 'Janette Doe', age: 22 }, { name: 'Johnny Doe', age: 71, birthdate: new Date('Feb 26, 1932') }]
const obj = arr[0]
const str = 'i am: The1\nAND\t,_L?on*e%ly.'
const date = new Date('2019-01-20T10:09:08')
Object.extend.version >> JSON.parse(await download('./package.json')).version
Object.access({ i: 0 }, 'i') >> 0
Array.map([{ i: 0 }, { i: 1 }], 'i') >> [0, 1]
// TODO: Object.extend(false) remove extended prototypes
// [!!obj.map, !!date.plus] >> [false, false]
// Object.extend([Date])
// [!!obj.map, !!date.plus] >> [false, true]
// Object.extend(true) >> ['Object.map#shortcut', 'Object.reduce', 'Object.filter#shortcut', 'Object.find#shortcut', 'Object.findIndex#shortcut', 'Object.equal', 'Object.access', 'Object.extend#core', 'Object.keys#native', 'Object.values#native', 'Array.group#shortcut', 'Array.unique', 'Array.min', 'Array.max', 'Array.sum', 'Array.mean', 'Array.median', 'Array.map#native#shortcut', 'Array.reduce#native', 'Array.filter#native#shortcut', 'Array.find#native#shortcut', 'Array.findIndex#native#shortcut', 'Array.sort#native#shortcut', 'Array.reverse#native', 'Function.wrap', 'Function.partial', 'Function.every', 'Function.wait', 'Function.debounce', 'Function.throttle', 'Function.memoize', 'String.lower', 'String.upper', 'String.capitalize', 'String.words', 'String.format#shortcut', 'Number.duration', 'Number.format#shortcut', 'Date.relative', 'Date.getWeek', 'Date.getQuarter', 'Date.getLastDate', 'Date.format#shortcut', 'Date.modify', 'Date.plus', 'Date.minus', 'Date.start', 'Date.end', 'RegExp.escape', 'RegExp.plus', 'RegExp.minus']
Object.extend(true)
obj.keys() >> ['name', 'age']
obj.values() >> ['Jane Doe', 22]
obj.map(v => v * 2 || v) >> { name: 'Jane Doe', age: 44 }
obj.reduce((acc, v, k) => (acc[v] = k, acc), {}) >> { 'Jane Doe': 'name', 22: 'age' }
obj.filter(Number) >> { age: 22 }
obj.find(v => v > 10) >> 22
obj.findIndex(22) >> 'age'
;[null, 'a', undefined, /a/].map() >> [null, 'a', undefined, /a/]
;[null, 'a', undefined, /a/].filter() >> ['a', /a/]
arr.map('name').filter(/Ja/) >> ['Jane Doe', 'Janette Doe']
arr.filter('name') >> arr
arr.find({ name: /Ja/ }) >> { name: 'Jane Doe', age: 22 }
arr.group(v => !!v.name)[true] >> arr
arr.group('age').map(g => g.map('name')) >> { 22: ['Jane Doe', 'Janette Doe'], 29: ['John Doe'], 71: ['Johnny Doe'] }
arr.group(['age', 'name']).map(g => g.map(g2 => g2.length)) >> { '22': { 'Jane Doe': 1, 'Janette Doe': 1 }, '29': { 'John Doe': 1 }, '71': { 'Johnny Doe': 1 } }
arr.group(['age', 'name']).map(g => g.map('length')) >> { 22: { 'Jane Doe': 1, 'Janette Doe': 1 }, 29: { 'John Doe': 1 }, 71: { 'Johnny Doe': 1 } }
arr.map('name').sort() >> ['Jane Doe', 'Janette Doe', 'John Doe', 'Johnny Doe']
;[['b', {}], ['c', {}], ['a', {}]].sort([1, 0]) >> [['a', {}], ['b', {}], ['c', {}]]
arr.sort(v => v.age).map(v => v.age) >> arr.sort('age').map('age')
;['10 arbres', '3 arbres', 'réservé', 'Cliché', 'Premier', 'communiqué', 'café', 'Adieu'].sort() >> ['3 arbres', '10 arbres', 'Adieu', 'café', 'Cliché', 'communiqué', 'Premier', 'réservé']
;[[null, 1], [null, 2], [1, 3], [null, 4]].sort((a, b) => (a[0] > b[0] ? -1 : 1)).sort((a, b) => (a[0] > b[0] ? -1 : 1)) >> [[null, 1], [null, 2], [1, 3], [null, 4]].sort((a, b) => (a[0] > b[0] ? -1 : 1))
;[[null, 1], [null, 2], [1, 3], [null, 4]].sort([0]).sort([0]) >> [[null, 1], [null, 2], [1, 3], [null, 4]].sort([0])
arr.sort(['-age', 'name']).map(v => [v.age, v.name]) >> [[71, 'Johnny Doe'], [29, 'John Doe'], [22, 'Jane Doe'], [22, 'Janette Doe']]
arr.map('age').unique() >> [22, 29, 71]
arr.map('age').sum() >> 144
arr.map('age').min() >> 22
arr.map('age').max() >> 71
arr.map('age').mean() >> 36
arr.map('age').median() >> 25.5
;((a, b) => [a, b]).partial(null, 2)(1) >> [1, 2]
;(x => x).wrap((fn, x) => fn(x / 2) / 2)(4) >> 1
const mem = (x => x / 2).memoize()
mem(2)
mem(2)
mem.cache['[2]'] >> 1
str.words() >> ['i', 'am', 'The', '1', 'AND', 'Lonely']
str.format() >> 'I Am The 1 And Lonely'
str.format('title') >> 'I Am The 1 And Lonely'
str.format('dash') >> 'i-am-the-1-and-lonely'
str.format('underscore') >> 'i_am_the_1_and_lonely'
str.format('camel') >> 'iAmThe1AndLonely'
str.format('pascal') >> 'IAmThe1AndLonely'
'{}{}{}'.format(0, 1, 2) >> '012'
'{}{}{}'.format('a', 'b') >> 'ab'
'{}{}{}'.format(['a', 'b']) >> 'ab'
'{1}{1}{1}{0}{0}'.format('a', 'b') >> 'bbbaa'
'{2}{2}{2}{1}{1}'.format(['a', 'b', '']) >> 'bb'
'{}{}{}{1}{1}{1}{0}{0}'.format('a', 'b') >> 'abbbbaa'
'{k2}{k2}{k3}'.format({ k1: 'a', k2: 'b' }) >> 'bb'
'{66} pears x {3} apples'.format((x, i) => +x + i) >> '66 pears x 4 apples'
;(0.1 * 3 * 1000).format() >> 300
;(-0.000123456789).format(1) >> '-100µ'
;(123456789000).format(2) >> '120G'
;(1234.43210).format('en') >> '1,234.432'
;(1234.43210).format('fr') >> '1 234,432'
;(1234.43210).format('en', { style: 'currency', currency: 'JPY' }) >> '¥1,234'
;(1234.43210).format('ja', { style: 'unit', unit: 'kilometer-per-hour', unitDisplay: 'narrow', maximumSignificantDigits: 3 }) >> '1,230km/h'
;Math.floor(1234.43210 * 100).format('en', { style: 'unit', unit: 'percent' }) >> '123,443%'
Object.getOwnPropertyNames(Math)
  .filter(k => typeof Math[k] === 'function')
  .forEach(k => (Number[k] = Math[k]))
Object.extend(true)
;(3.1415).floor() >> 3
Math.PI.cos() >> -1
;(3).pow(2) >> 9
;(-36666666).duration() >> '-10 hours'
date.minus('12 seconds').relative(date) >> '12 seconds ago'
date.format() >> '2019-01-20'
date.format('DD/MM/YYYY hhhmmm') >> '20/01/2019 10h09m'
date.format('QQ WW') >> 'Q1 W3'
date.format('day, month, year', 'fr') >> '20 janvier 2019'
date.format('month, day, weekday, hour, minute, second') >> 'Sunday, January 20, 10:09:08 AM'
date.plus('day').format() >> '2019-01-21'
Date.getWeek(new Date('2015-02-26')) >> 8
Date.getWeek(new Date('2018-02-26')) >> 9
Date.getQuarter(new Date('2018-04-01')) >> 2
new Date('2019-01-01').plus(0.1 * 3 + ' day').format('YYYY-MM-DDThh:mm:ss') >> '2019-01-01T08:12:00'
new Date('2019-05-31').minus('3 month').format() >> '2019-02-28'
new Date('2019-05-31').plus('-3 month').format() >> '2019-02-28'
new Date('2019-01-31').plus('1 Month').format() >> '2019-02-28'
new Date('2019-01-31').minus('-1 month').format() >> '2019-02-28'
new Date('2016-02-29').plus('1 year').format() >> '2017-02-28'
new Date('2016-02-29').end('1 year').format() >> '2016-12-31'
new Date('2018-12-31').plus('1 month').format() >> '2019-01-31'
new Date('2018-12-31').minus('1 month').format() >> '2018-11-30'
new Date('2019-10-27').plus('1 day').format() >> '2019-10-28'
date.minus('1 year, 1 month, 1 day, hour, minute and 10 seconds').format('YYYY-MM-DDThh:mm:ss') >> '2017-12-19T09:07:58' // DEPRECATED //
date.start('month').format('YYYY-MM-DDThh:mm:ss') >> '2019-01-01T00:00:00'
date.end('year').format('YYYY-MM-DDThh:mm:ss') >> '2019-12-31T23:59:59'
date.format('mon, wday, hour') >> 'Sun (month: Jan), 10 AM'
date.format('hour, minute, second') >> '10:09:08'
new Date('Invalid').format('mon, wday, hour, minute') >> '-'
'a.b'.upper() >> 'A.B'
;[1, 2, 3].median() >> 2
;(1).duration() >> '1 millisecond'
;(1).format(10) >> '1'
new Date().plus('2 hours').relative() >> '2 hours from now'
;/john@gmail.com/.escape().source >> 'john@gmail\\.com'
;/QwErTy/.plus('i').flags >> 'i'
;/QwErTy/.minus('i').flags >> ''
;{ a: { b: [1, 2, 3] } }.access() >> { a: { b: [1, 2, 3] } }
;{ a: { b: [1, 2, 3] } }.access('a.b.length') >> 3
;{ a: { b: [1, 2, 3] } }.access('.a.b.length') >> 3
;{ a: { b: [1, 2, 3] } }.access(['a.b', 'a.b.length']) >> [[1, 2, 3], 3]
;{ a: { b: [1, 2, 3] } }.access({ a: 'a.b', b: 'a.b.length' }) >> { a: [1, 2, 3], b: 3 }
;[{ a: { b: [1, 2, 3] } }].access('0.a.b.length') >> 3
;{ a: { 'b-c': 1 } }.access('a.b-c') >> Object.access({ a: { 'b-c': 1 } }, "a['b-c']")
Object.equal([undefined, null, { a: { b: /c/ }, c: [{ d: 1 }] }, [], x => x, /a/gi, new Date('2020'), '', '&', 'A', false, true, NaN, -Infinity, -1, -0, 0, 1, Infinity], [undefined, null, { a: { b: /c/ }, c: [{ d: 1 }] }, [], x => x, /a/gi, new Date('2020'), '', '&', 'A', false, true, NaN, -Infinity, -1, -0, 0, 1, Infinity]) >> true
Object.equal([null], [null, undefined]) >> false
Object.extend(Object, 'notdefined') >> undefined
;[{ a: 1 }].find({ a: 1 }) >> { a: 1 }
;[{ a: 1 }].find([{ a: 1 }]) >> { a: 1 }
;[{ a: 1 }, { a: 2 }].find({ a: [2, 3] }) >> { a: 2 }

Array.shuffle = (arr, r) => (arr.forEach((v, i) => ((r = Math.floor(Math.random() * i)), ([arr[i], arr[r]] = [arr[r], arr[i]]))), arr)
Object.extend(true)
;[undefined, null, x => x, '', '&', 'A', false, true, NaN, -Infinity, -1, -0, 0, 1, Infinity].sort() >> [undefined, null, x => x, '', '&', 'A', false, true, NaN, -Infinity, -1, -0, 0, 1, Infinity].shuffle().sort()
;['A', '&', '', true, false, Infinity, -1, -0, NaN, 0, 1, -Infinity].sort() >> [false, true, NaN, -Infinity, -1, -0, 0, 1, Infinity, '', '&', 'A']
