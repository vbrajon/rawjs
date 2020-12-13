Object.prototypes = []
require('./raw.js')
const arr = [{ name: 'Jane Doe', age: 22 }, { name: 'John Doe', age: 29, birthdate: new Date('1989-11-14') }, { name: 'Janette Doe', age: 22 }, { name: 'Johnny Doe', age: 71, birthdate: new Date('Feb 26, 1932') }]
const obj = arr[0]
const str = 'i am: The1\nAND\t,_L?on*e%ly.'
const date = new Date('2019-01-20T10:09:08')
//>>

Object.map(obj, v => v * 2 || v) >> { name: 'Jane Doe', age: 44 }
Object.find(obj, v => v > 10) >> 22
Object.filter(obj, Number) >> { age: 22 }
Object.findIndex(obj, 22) >> 'age'
Object.reduce(obj, (acc, v, k) => ((acc[v] = k), acc), {}) >> { 'Jane Doe': 'name', 22: 'age' }
Object.access({ a: { b: [1, 2, 3] } }) >> { a: { b: [1, 2, 3] } }
Object.access({ a: { b: [1, 2, 3] } }, ['a', 'b', 'length']) >> 3
Object.access({ a: { b: [1, 2, 3] } }, 'a.b.length') >> 3
Object.access({ a: { b: [1, 2, 3] } }, '.a.b.length') >> 3
Object.access({ a: { b: [1, 2, 3] } }, '["a"]["b"].length') >> 3
Object.access({ a: { b: [1, 2, 3] } }, { a: 'a.b', b: 'a.b.length' }) >> { a: [1, 2, 3], b: 3 }
Object.access([{ a: { b: [1, 2, 3] } }], '0.a.b.length') >> 3
Object.access({ a: { 'b.c': 1 } }, 'a["b.c"]') >> 1
Object.access({ a: { b: 1 } }, 'a.b') >> 1
Object.access({ 'a.b': 1 }, 'a.b') >> 1
Object.access({ 'a.b': 1 }, ['a', 'b']) >> null
Object.equal([null], [null, undefined]) >> false
x = Object.equal(
  [undefined, null, { a: { b: /c/ }, c: [{ d: 1 }] }, [], x => x, /a/gi, new Date('2020'), '', '&', 'A', false, true, NaN, -Infinity, -1, -0, 0, 1, Infinity],
  [undefined, null, { a: { b: /c/ }, c: [{ d: 1 }] }, [], x => x, /a/gi, new Date('2020'), '', '&', 'A', false, true, NaN, -Infinity, -1, -0, 0, 1, Infinity],
)
x >> true

Array.map([null, 'a', undefined, /a/]) >> [null, 'a', undefined, /a/]
Array.filter([null, 'a', undefined, /a/]) >> ['a', /a/]
Array.filter(arr, { name: /Ja/ }) >> [{ name: 'Jane Doe', age: 22 }, { name: 'Janette Doe', age: 22 }]
Array.filter(arr, 'name') >> arr
Array.find(arr, { name: /Ja/ }) >> { name: 'Jane Doe', age: 22 }
Array.group(arr, v => !!v.name)[true] >> arr
!!Array.group(arr, 'age') >> true
!!Array.group(arr, ['age', 'name']) >> true
Array.map(arr, 'name').sort() >> ['Jane Doe', 'Janette Doe', 'John Doe', 'Johnny Doe']
Array.sort(arr, 'age') >> Array.sort(arr, v => v.age)
Array.sort(arr, 'age') >> Array.sort(arr, (a, b) => (a.age === b.age ? 0 : a.age > b.age ? 1 : -1))
x = Array.sort(arr, function() {
  return arguments[0].age === arguments[1].age ? 0 : arguments[0].age > arguments[1].age ? 1 : -1
})
Array.sort(arr, 'age') >> x
Array.sort([[null, 1], [null, 2], [1, 3], [null, 4]], [0, -1]) >> [[1, 3], [null, 4], [null, 2], [null, 1]]
Array.sort(arr, ['-age', 'name']).map(v => [v.age, v.name]) >> [[71, 'Johnny Doe'], [29, 'John Doe'], [22, 'Jane Doe'], [22, 'Janette Doe']]
Array.sort(['10 arbres', '3 arbres', 'réservé', 'Cliché', 'Premier', 'communiqué', 'café', 'Adieu'], 'fr', { numeric: true }) >> ['3 arbres', '10 arbres', 'Adieu', 'café', 'Cliché', 'communiqué', 'Premier', 'réservé']
Array.unique(Array.map(arr, 'age')) >> [22, 29, 71]
Array.sum(Array.map(arr, 'age')) >> 144
Array.min(Array.map(arr, 'age')) >> 22
Array.max(Array.map(arr, 'age')) >> 71
Array.mean(Array.map(arr, 'age')) >> 36
Array.median(Array.map(arr, 'age')) >> 25.5
Array.find([{ a: 1 }], { a: 1 }) >> { a: 1 }
Array.findIndex([{ a: 1 }], { a: 1 }) >> 0
Array.find([{ a: 1 }, { a: 2 }], { a: [2, 3] }) >> { a: 2 }
const shuffle = (arr, r) => (arr.forEach((v, i) => ((r = Math.floor(Math.random() * i)), ([arr[i], arr[r]] = [arr[r], arr[i]]))), arr)
shuffle([undefined, x => x, /a/gi, '', '&', 'A', false, true, -Infinity, -1, 0, 1, Infinity]).sort() >> shuffle([undefined, x => x, /a/gi, '', '&', 'A', false, true, -Infinity, -1, 0, 1, Infinity]).sort()
Array.median([1, 2, 3]) >> 2

Function.partial((a, b) => [a, b], null, 2)(1) >> [1, 2]
Function.wrap(x => x, (fn, x) => fn(x / 2) / 2)(4) >> 1
const mem = Function.memoize(x => x / 2)
mem(2)
mem(2)
mem.cache['[2]'] >> 1

String.upper('a.b') >> 'A.B'
String.lower('A.B') >> 'a.b'
String.words(str) >> ['i', 'am', 'The', '1', 'AND', 'Lonely']
String.format(str) >> 'I Am The 1 And Lonely'
String.format(str, 'title') >> 'I Am The 1 And Lonely'
String.format(str, 'dash') >> 'i-am-the-1-and-lonely'
String.format(str, 'underscore') >> 'i_am_the_1_and_lonely'
String.format(str, 'camel') >> 'iAmThe1AndLonely'
String.format(str, 'pascal') >> 'IAmThe1AndLonely'
String.format('{}{}{}', 0, 1, 2) >> '012'
String.format('{}{}{}', 'a', 'b') >> 'ab'
String.format('{}{}{}', ['a', 'b']) >> 'ab'
String.format('{1}{1}{1}{0}{0}', 'a', 'b') >> 'bbbaa'
String.format('{2}{2}{2}{1}{1}', ['a', 'b', '']) >> 'bb'
String.format('{}{}{}{1}{1}{1}{0}{0}', 'a', 'b') >> 'abbbbaa'
String.format('{user.name} is <strong>{{user.age}}</strong>', { user: obj }) >> 'Jane Doe is <strong>{22}</strong>'
String.format('{.length} users starting with {0.name} & {1.name}', arr) >> '4 users starting with Jane Doe & John Doe'
String.format('{k2}{k2}{k3}', { k1: 'a', k2: 'b' }) >> 'bb'
String.format('{66} pears x {3} apples', (x, i) => +x + i) >> '66 pears x 4 apples'

Number.format(0.1 * 3 * 1000) >> 300
Number.format(-0.000123456789, 1) >> '-100µ'
Number.format(123456789000, 2) >> '120G'
Number.format(1, 10) >> '1'
Number.format(1010.0101, 'en') >> '1,010.01'
Number.format(1010.0101, 'fr') >> '1 010,01'
Number.duration(-36666666) >> '-10 hours'
Number.duration(1) >> '1 millisecond'

Date.format(date) >> '2019-01-20T10:09:08+01:00'
Date.format(date, 'DD/MM/YYYY hhhmmmsssSSS') >> '20/01/2019 10h09m08s000'
Date.format(date, 'QQ WW') >> 'Q1 W3'
Date.format(date, 'day, month, year', 'fr') >> '20 janvier 2019'
Date.format(date, 'month, day, weekday, hour, minute, second') >> 'Sunday, January 20, 10:09:08 AM'
Date.format(date, 'mon, wday, hour') >> 'Jan Sun, 10 AM'
Date.format(date, 'hour, minute, second') >> '10:09:08'
Date.format(Date.start(date, 'month'), 'YYYY-MM-DD hh:mm:ss') >> '2019-01-01 00:00:00'
Date.format(Date.end(date, 'year'), 'YYYY-MM-DD hh:mm:ss') >> '2019-12-31 23:59:59'
Date.format(new Date('2019-01-01 00:00'), 'YYYY-MM-DD hh:mm:ss Z') >> '2019-01-01 00:00:00 +01:00'
Date.format(Date.plus(new Date('2020-10-01 20:00:00'), '25 day'), 'YYYY-MM-DD hh:mm:ss') >> '2020-10-26 20:00:00'
Date.format(new Date('Invalid'), 'mon, wday, hour, minute') >> '-'
Date.getWeek(new Date('2015-02-26')) >> 8
Date.getWeek(new Date('2018-02-26')) >> 9
Date.getQuarter(new Date('2018-04-01')) >> 2
Date.plus(new Date('2018-11-30T00:00:00'), '3 month') >> new Date('2019-02-28T00:00:00')
Date.minus(new Date('2018-11-30T00:00:00'), '-3 month') >> new Date('2019-02-28T00:00:00')
Date.plus(new Date('2018-12-31T00:00:00'), '1 month') >> new Date('2019-01-31T00:00:00')
Date.minus(new Date('2019-01-01T00:00:00'), '1 month') >> new Date('2018-12-01T00:00:00')
Date.plus(new Date('2016-02-29T00:00:00'), '1 year') >> new Date('2017-02-28T00:00:00')
Date.start(new Date('2018-02-28T00:00:00'), 'month') >> new Date('2018-02-01T00:00:00')
Date.end(new Date('2016-02-29T00:00:00'), 'year') >> new Date('2016-12-31T23:59:59')
Date.relative(Date.minus(date, '1 second'), date) >> '1 second ago'
Date.relative(Date.plus(date, '2 hours'), date) >> '2 hours from now'
/* EXPECTED */ Date.plus(new Date('2019-01-31'), '1.7 Month') >> new Date('2019-02-28T00:00:00')
/* DEPRECATED */ Date.format(Date.minus(date, '1 year, 1 month, 1 day, hour, minute and 10 seconds'), 'YYYY-MM-DD hh:mm:ss') >> '2017-12-19 09:07:58'

RegExp.escape(/john@gmail.com/).source >> 'john@gmail\\.com'
RegExp.plus(/QwErTy/, 'i').flags >> 'i'
RegExp.minus(/QwErTy/, 'i').flags >> ''
