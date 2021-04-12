import './cut.js'
import * as lodash from 'lodash-es'
import moment from 'moment'
import datefns from 'date-fns'
const users = [
  { name: 'John Doe', age: 29 },
  { name: 'Jane Doe', age: 22 },
  { name: 'Janette Doe', age: 22 },
  { name: 'Johnny Doe', age: 71, birthdate: new Date('Feb 26, 1932') },
]
const user = users[0]
const userAges = users.map(v => v.age)
const userAgesAsc = [users[1], users[2], users[0], users[3]]
const str = 'i_am:\nThe1\tAND, Only.'
const date = new Date('2019-01-20T10:09:08')
const shuffle = (arr, r) => (arr.forEach((v, i) => ((r = Math.floor(Math.random() * i)), ([arr[i], arr[r]] = [arr[r], arr[i]]))), arr)
const sortingNative = [[], -1, /a/gi, 0, Infinity, NaN, new Date('2020'), { a: [{ b: 1 }] }, 'a', false, null, true, x => x, undefined]
const sorting = [[], -1, /a/gi, 0, Infinity, NaN, new Date('2020'), { a: [{ b: 1 }] }, 'a', false, null, true, x => x, undefined]
const sortingClone = [[], -1, /a/gi, 0, Infinity, NaN, new Date('2020'), { a: [{ b: 1 }] }, 'a', false, null, true, x => x, undefined]
const sortingShuffled = shuffle([[], -1, /a/gi, 0, Infinity, NaN, new Date('2020'), { a: [{ b: 1 }] }, 'a', false, null, true, x => x, undefined])

export default [
  // Object
  {
    vanilla: (obj, fn) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fn(v, k, obj)])),
    cut: Object.map,
    // lodash: lodash.map,
    tests: [[[user, v => v * 2 || v], { name: 'John Doe', age: 58 }]],
  },
  {
    vanilla: (obj, fn) => Object.fromEntries(Object.entries(obj).filter(([k, v]) => fn(v, k, obj))),
    cut: Object.filter,
    // lodash: lodash.filter,
    tests: [[[user, Number], { age: 29 }]],
  },
  {
    vanilla: (obj, fn) => obj[Object.keys(obj).find((k, i, ks) => fn(obj[k], k, obj, i, ks))],
    cut: Object.find,
    lodash: lodash.find,
    tests: [[[user, v => v > 10], 29]],
  },
  {
    vanilla: (obj, fn) => Object.keys(obj).find((k, i, ks) => fn(obj[k], k, obj, i, ks)),
    cut: Object.findIndex,
    lodash: lodash.findKey,
    tests: [[[user, v => v === 29], 'age']],
  },
  {
    vanilla: (obj, fn, base = null) => Object.entries(obj).reduce((acc, [k, v], i, ks) => fn(acc, v, k, obj, i, ks), base),
    cut: Object.reduce,
    lodash: lodash.reduce,
    tests: [[[user, (acc, v, k) => ((acc[v] = k), acc), {}], { 'John Doe': 'name', 29: 'age' }]],
  },
  {
    cut: Object.access,
    // lodash: lodash.get,
    tests: [
      [[{ a: { b: [1, 2, 3] } }], { a: { b: [1, 2, 3] } }],
      [[{ a: { b: [1, 2, 3] } }, ['a', 'b', 'length']], 3],
      [[{ a: { b: [1, 2, 3] } }, 'a.b.length'], 3],
      [[{ a: { b: [1, 2, 3] } }, '.a.b.length'], 3],
      [[{ a: { b: [1, 2, 3] } }, '["a"]["b"].length'], 3],
      [[{ a: { b: [1, 2, 3] } }, { a: 'a.b', b: 'a.b.length' }], { a: [1, 2, 3], b: 3 }],
      [[[{ a: { b: [1, 2, 3] } }], '0.a.b.length'], 3],
      [[{ a: { 'b.c': 1 } }, 'a["b.c"]'], 1],
      [[{ a: { b: 1 } }, 'a.b'], 1],
      [[{ 'a.b': 1 }, 'a.b'], 1],
      [[{ 'a.b': 1 }, ['a', 'b']], null],
      [[3, null], undefined],
      [[null, 3], null],
    ],
  },
  {
    cut: Object.equal,
    // lodash: lodash.isEqual,
    tests: [
      [[[null], [null, undefined]], false],
      [[sorting, sortingClone], true],
    ],
  },
  // Array
  {
    cut: Array.map,
    tests: [[[[null, 'a', undefined, /a/]], [null, 'a', undefined, /a/]]],
  },
  {
    cut: Array.filter,
    tests: [
      [[[null, 'a', undefined, /a/]], ['a', /a/]],
      [
        [users, { name: /Ja/ }],
        [
          { name: 'Jane Doe', age: 22 },
          { name: 'Janette Doe', age: 22 },
        ],
      ],
      [[users, 'name'], users],
      [
        [
          [{ a: 1 }, { a: 2 }, { a: 3, b: 3 }],
          [{ a: x => x > 2 }, { b: 3 }, { a: 2 }],
        ],
        [{ a: 2 }, { a: 3, b: 3 }],
      ],
    ],
  },
  {
    cut: Array.find,
    tests: [
      [[users, { name: /Ja/ }], { name: 'Jane Doe', age: 22 }],
      [[[{ a: 1 }], { a: 1 }], { a: 1 }],
      [[[{ a: 1 }, { a: 2 }], { a: [2, 3] }], { a: 2 }],
    ],
  },
  {
    cut: Array.findIndex,
    tests: [[[[{ a: 1 }], { a: 1 }], 0]],
  },
  {
    cut: Array.group,
    tests: [
      [[users, v => 'x'], { x: users }],
      [[[{ a: 1 }], 'a'], { 1: [{ a: 1 }] }],
      [[[{ a: 1 }], 'b'], { null: [{ a: 1 }] }],
      [[[{ a: 1, b: 2 }], ['a', 'b']], { 1: { 2: [{ a: 1, b: 2 }] } }],
    ],
  },
  {
    vanilla: arr => arr.slice().reverse(),
    cut: Array.reverse,
    tests: [[[[1, 2, 3]], [3, 2, 1]]],
  },
  {
    cut: Array.sort,
    tests: [
      [[userAges], [22, 22, 29, 71]],
      [[users, 'age'], userAgesAsc],
      [[users, v => v.age], userAgesAsc],
      [[users, (a, b) => (a.age === b.age ? 0 : a.age > b.age ? 1 : -1)], userAgesAsc],
      [
        [
          users,
          function () {
            return arguments[0].age === arguments[1].age ? 0 : arguments[0].age > arguments[1].age ? 1 : -1
          },
        ],
        userAgesAsc,
      ],
      [[[[null, 1], [1, 2], [null, 3]], [0, -1]], [[1, 2], [null, 3], [null, 1]]], // eslint-disable-line
      [[[[null, 1], [1, 2], [null, 3]], [v => v[0], -1]], [[1, 2], [null, 3], [null, 1]]], // eslint-disable-line
      [
        fn => fn(users, ['-age', 'name']).map(v => [v.age, v.name]),
        [
          [71, 'Johnny Doe'],
          [29, 'John Doe'],
          [22, 'Jane Doe'],
          [22, 'Janette Doe'],
        ],
      ],
      [
        [['10 arbres', '3 arbres', 'réservé', 'Cliché', 'Premier', 'communiqué', 'café', 'Adieu'], 'fr', { numeric: true }],
        ['3 arbres', '10 arbres', 'Adieu', 'café', 'Cliché', 'communiqué', 'Premier', 'réservé'],
      ],
    ],
  },
  {
    cut: Array.unique,
    tests: [[[userAges], [29, 22, 71]]],
  },
  {
    cut: Array.sum,
    tests: [[[userAges], 144]],
  },
  {
    cut: Array.min,
    tests: [[[userAges], 22]],
  },
  {
    cut: Array.max,
    tests: [[[userAges], 71]],
  },
  {
    cut: Array.mean,
    tests: [[[userAges], 36]],
  },
  {
    cut: Array.median,
    tests: [
      [[userAges], 25.5],
      [[[1, 2, 3]], 2],
    ],
  },
  // Function
  {
    cut: Function.decorate,
    tests: [
      [fn => fn(x => x)(1), 1],
      [fn => fn(x => x, null)(1), 1],
      [fn => fn(x => x, { around: (fn, x) => fn(x * 2) * 2 })(1), 4],
      [fn => fn(x => x, { before: x => x * 2 })(1), 2],
      [fn => fn(x => x, { after: x => x * 2 })(1), 2],
      [fn => fn(x => x, { before: [x => x * 2, x => [x * 2]], after: [x => x * 2], around: [(fn, x) => fn(x * 2) * 2] })(1), 32],
      [
        fn => {
          const decorated = fn(x => x, { before: x => x + 1 })
          const decoratedTwice = fn(decorated, { before: x => x + 2 })
          return decoratedTwice.before.map(f => f.toString())
        },
        [x => x + 1, x => x + 2].map(f => f.toString()),
      ],
      [
        fn => {
          const decorated = fn(x => x)
          decorated.around = [(fn, x) => 10]
          return decorated()
        },
        10,
      ],
    ],
  },
  {
    cut: Function.partial,
    tests: [[fn => fn((a, b) => [a, b], null, 2)(1), [1, 2]]],
  },
  {
    cut: Function.memoize,
    tests: [
      [
        fn => {
          const memory = fn(x => x / 2)
          memory(2)
          memory(2)
          return memory.cache['[2]']
        },
        1,
      ],
    ],
  },
  // String
  {
    cut: String.upper,
    lodash: lodash.toUpper,
    tests: [[['a.b'], 'A.B']],
  },
  {
    cut: String.lower,
    lodash: lodash.toLower,
    tests: [[['A.B'], 'a.b']],
  },
  {
    cut: String.words,
    lodash: lodash.words,
    tests: [[[str], ['i', 'am', 'The', '1', 'AND', 'Only']]],
  },
  {
    cut: String.format,
    tests: [
      [[str], 'I Am The 1 And Only'],
      [[str, 'title'], 'I Am The 1 And Only'],
      [[str, 'dash'], 'i-am-the-1-and-only'],
      [[str, 'underscore'], 'i_am_the_1_and_only'],
      [[str, 'camel'], 'iAmThe1AndOnly'],
      [[str, 'pascal'], 'IAmThe1AndOnly'],
      [['{}{}{}', 0, 1, 2], '012'],
      [['{}{}{}', 'a', 'b'], 'ab'],
      [['{}{}{}', ['a', 'b']], 'ab'],
      [['{1}{1}{1}{0}{0}', 'a', 'b'], 'bbbaa'],
      [['{2}{2}{2}{1}{1}', ['a', 'b', '']], 'bb'],
      [['{}{}{}{1}{1}{1}{0}{0}', 'a', 'b'], 'abbbbaa'],
      [['{user.name} is <strong>{{user.age}}</strong>', { user }], 'John Doe is <strong>{29}</strong>'],
      [['{.length} users starting with {0.name} & {1.name}', users], '4 users starting with John Doe & Jane Doe'],
      [['{k2}{k2}{k3}', { k1: 'a', k2: 'b' }], 'bb'],
      [['{66} pears x {3} apples', (x, i) => +x + i], '66 pears x 4 apples'],
    ],
  },
  // Number
  {
    cut: Number.format,
    tests: [
      [[0.1 * 3 * 1000], 300],
      [[-0.000123456789, 1], '-100µ'],
      [[123456789000, 2], '120G'],
      [[1, 10], '1'],
      [[1010.0101, 'en'], '1,010.01'],
      [[1010.0101, 'fr'], '1 010,01'],
    ],
  },
  {
    cut: Number.duration,
    tests: [
      [[-36666666], '-10 hours'],
      [[1], '1 millisecond'],
    ],
  },
  // Date
  {
    cut: Date.format,
    tests: [
      [[date], '2019-01-20T10:09:08+01:00'],
      [[date, 'DD/MM/YYYY hhhmmmsssSSS'], '20/01/2019 10h09m08s000'],
      // [[date, 'QQ WW'], 'Q1 W4'],
      [[date, 'day, month, year', 'fr'], '20 janvier 2019'],
      [[date, 'month, day, weekday, hour, minute, second'], 'Sunday, January 20, 10:09:08 AM'],
      [[date, 'mon, wday, hour'], 'Jan Sun, 10 AM'],
      [[date, 'hour, minute, second'], '10:09:08'],
      [[Date.start(date, 'month'), 'YYYY-MM-DD hh:mm:ss'], '2019-01-01 00:00:00'],
      [[Date.end(date, 'year'), 'YYYY-MM-DD hh:mm:ss'], '2019-12-31 23:59:59'],
      [[new Date('2019-01-01 00:00'), 'YYYY-MM-DD hh:mm:ss Z'], '2019-01-01 00:00:00 +01:00'],
      [[Date.plus(new Date('2020-10-01 20:00:00'), '25 day'), 'YYYY-MM-DD hh:mm:ss'], '2020-10-26 20:00:00'],
      [[new Date('Invalid'), 'mon, wday, hour, minute'], '-'],
    ],
  },
  {
    cut: Date.getWeek,
    moment: date => moment(date).week(),
    datefns: datefns.getWeek,
    tests: [
      // [[new Date('2015-02-26')], 9],
      // [[new Date('2018-02-26')], 9],
      // [[new Date('2016-01-01')], 53],
      // [[new Date('2017-01-01')], 52],
      // [[new Date('2018-01-01')], 1],
    ],
  },
  {
    cut: Date.getQuarter,
    tests: [[[new Date('2018-04-01')], 2]],
  },
  {
    cut: Date.plus,
    tests: [
      [[new Date('2018-11-30T00:00:00'), '3 month'], new Date('2019-02-28T00:00:00')],
      [[new Date('2018-12-31T00:00:00'), '1 month'], new Date('2019-01-31T00:00:00')],
      [[new Date('2016-02-29T00:00:00'), '1 year'], new Date('2017-02-28T00:00:00')],
      [/* EXPECTED */ [new Date('2019-01-31'), '1.7 Month'], new Date('2019-02-28T00:00:00')],
    ],
  },
  {
    cut: Date.minus,
    tests: [
      [[new Date('2018-11-30T00:00:00'), '-3 month'], new Date('2019-02-28T00:00:00')],
      [[new Date('2019-01-01T00:00:00'), '1 month'], new Date('2018-12-01T00:00:00')],
      // [/* DEPRECATED */ [Date.plus(date, '1 year, 1 month, 1 day, hour, minute and 10 seconds'), 'YYYY-MM-DD hh:mm:ss'], new Date('2017-12-19 09:07:58')],
    ],
  },
  {
    cut: Date.start,
    tests: [[[new Date('2018-02-28T00:00:00'), 'month'], new Date('2018-02-01T00:00:00')]],
  },
  {
    cut: Date.end,
    tests: [[[new Date('2016-02-29T00:00:00'), 'year'], new Date('2016-12-31T23:59:59')]],
  },
  {
    cut: Date.relative,
    tests: [
      [[Date.minus(date, '1 second'), date], '1 second ago'],
      [[Date.plus(date, '2 hours'), date], '2 hours from now'],
    ],
  },
  // RegExp
  {
    cut: RegExp.escape,
    tests: [[fn => fn(/john@gmail.com/).source, 'john@gmail\\.com']],
  },
  {
    cut: RegExp.plus,
    tests: [[fn => fn(/QwErTy/, 'i').flags, 'i']],
  },
  {
    cut: RegExp.minus,
    tests: [[fn => fn(/QwErTy/, 'i').flags, '']],
  },
]
