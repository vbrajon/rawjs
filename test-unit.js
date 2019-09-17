if (typeof global !== 'undefined') {
  window = global
  window.performance = { now: () => +process.hrtime().join('.') }
}

window.eq = (a, b) => {
  if (a === b) return true
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime()
  if (!a || !b || (typeof a != 'object' && typeof b !== 'object')) return a === b
  if (a === null || a === undefined || b === null || b === undefined) return false
  if (a.prototype !== b.prototype) return false
  const keys = Object.keys(a)
  if (keys.length !== Object.keys(b).length) return false
  return keys.every(k => eq(a[k], b[k]))
}

window.setup = `require('./raw.js')
raw()
arr = [{ name: 'Jane Doe', age: 22 }, { name: 'John Doe', age: 29, birthdate: new Date('1989-11-14') }, { name: 'Janette Doe', age: 22 }, { name: 'Johnny Doe', age: 71, birthdate: new Date('Feb 26, 1932') }]
obj = arr[0]
str = 'i am: The1\\nAND\\t,_L?on*e%ly.'
date = new Date('2019-01-20 10:09:08')
`

window.tests = [
  // Object
  ['obj.map(v => v * 2 || v)', { name: 'Jane Doe', age: 44 }],
  ['obj.find(22)', 'age'],
  [`obj.filter(Number)`, { age: 22 }],
  ['obj.reduce((acc, v, k) => (acc[v] = k, acc), {})', { 'Jane Doe': 'name', 22: 'age' }],
  // Array
  [`arr.map('name').sort()`, ['Jane Doe', 'Janette Doe', 'John Doe', 'Johnny Doe']],
  [`arr.map('age').unique()`, [22, 29, 71]],
  [`arr.map('age').sum()`, 144],
  [`arr.map('age').min()`, 22],
  [`arr.map('age').max()`, 71],
  [`arr.map('age').mean()`, 36],
  [`arr.map('age').median()`, 25.5],
  [`arr.group('age').map(g => g.map('name'))`, { 22: ['Jane Doe', 'Janette Doe'], 29: ['John Doe'], 71: ['Johnny Doe'] }],
  // [`arr.group(['age', 'name']).map(g => g.map(g => g.map('birthdate')))`, { 22: { 'Jane Doe': [], 'Janette Doe': [] }, 29: { 'John Doe': [] }, 71: { 'Johnny Doe': [] } }],
  [`arr.sort(['-age', 'name']).map(d => [d.age, d.name])`, [[71, 'Johnny Doe'], [29, 'John Doe'], [22, 'Jane Doe'], [22, 'Janette Doe']]],
  [`[null, 'a', undefined].filter()`, ['a']],
  [`[{ a: { b: 'one' } }, { a: { b: 'two' } }].map('a.b.capitalize')`, ['One', 'Two']],
  // Function
  [`((a, b) => [a, b]).partial(null, 2)(1)`, [1, 2]],
  [
    `const mem = (x => x / 2).memoize()
mem(2)
mem.cache['[2]']`,
    1,
  ],
  [`await (() => 1).wait(100).promise`, 1],
  [
    `let n = 0, inc = () => n++
inc.every(50, 5)
await (() => n).wait(500).promise`,
    5,
  ],
  [
    `let n = 0, inc = () => n++
inc.debounce(75).every(50, 5)
await (() => n).wait(500).promise`,
    1,
  ],
  [
    `let n = 0, inc = () => n++
inc.throttle(75).every(50, 5)
await (() => n).wait(500).promise`,
    3,
  ],
  // String
  [`str.words()`, ['i', 'am', 'The', '1', 'AND', 'Lonely']],
  [`str.join('title')`, 'I Am The 1 And Lonely'],
  [`str.join('-')`, 'i-am-The-1-AND-Lonely'],
  [`str.join('dash')`, 'i-am-the-1-and-lonely'],
  [`str.join('underscore')`, 'i_am_the_1_and_lonely'],
  [`str.join('camel')`, 'iAmThe1AndLonely'],
  [`str.join('pascal')`, 'IAmThe1AndLonely'],
  [`'{}{}{}'.format('a', 'b')`, 'ab{}'],
  [`'{1}{0}{}{1}'.format('a', 'b')`, 'baab'],
  [`'{k2}{k2}{k3}'.format({ k1: 'a', k2: x => 'b' })`, 'bb{k3}'],
  [`'66 pears x 3 apples'.format({ [/\\d+/]: x => x * 2 })`, '132 pears x 6 apples'],
  // Number
  [`(.1 * 3).format()`, 0.3],
  [`(-.000123456789).format(1)`, '-100µ'],
  [`(123456789000).format(2)`, '120G'],
  [`(1010.01010).format('en')`, '1,010.01'],
  [`(1010.01010).format('fr')`, '1 010,01'],
  [`(3.1415).floor()`, 3],
  [`Math.PI.cos()`, -1],
  [`(3).pow(2)`, 9],
  [`(36666666).duration()`, '10 hours'],
  // Date
  [`date.format()`, '2019-01-20'],
  [`date.format('DD/MM/YYYY hhhmmm')`, '20/01/2019 10h09m'],
  [`date.format('day, month, year', 'fr')`, '20 janvier 2019'],
  [`date.format('month, day, weekday, hour, minute, second')`, 'Sunday, January 20, 10:09:08 AM'],
  [`date.plus('day').format()`, '2019-01-21'],
  [`new Date('2019-05-31').minus('3 month').format()`, '2019-02-28'],
  [`new Date('2019-01-31').plus('1 month').format()`, '2019-02-28'],
  [`new Date('2016-02-29').plus('1 year').format()`, '2017-02-28'],
  [`date.plus('1 month, 11 days').format()`, '2019-02-28'],
  [`date.minus('1 month, 2 days').format()`, '2018-12-18'],
  [`date.start('month').toISOString()`, '2018-12-31T23:00:00.000Z'],
  [`date.end('year').toISOString()`, '2019-12-31T22:59:59.000Z'],
  [`new Date().plus('14 days').relative()`, '2 weeks from now'],
  // RegExp
  [`/(parenthesis)/.escape().source`, '\\(parenthesis\\)'],
  [`/insensitive/.plus('i').flags`, 'i'],
  [`/sensitive/i.minus('i').flags`, ''],
  // Advanced - Extend
  [`(Object.custom = x => 1, raw(), typeof {}.custom)`, 'function'],
  [`(delete Object.prototype.custom, delete Object.custom, typeof {}.custom)`, 'undefined'],
  [`Array.prototype._map.toString()`, 'function map() { [native code] }'],
  [`[]._map.toString()`, 'function map() { [native code] }'],
  ['raw.version', '1.1.1'],
]

window.run_string = async s => {
  let output, error
  const start = performance.now()
  try {
    output = await eval('async () => ' + '{\n' + s.split('\n').map((l, i, ls) => i + 1 === ls.length ? 'return ' + l : l).join('\n') + '\n}')()
  } catch (e) {
    error = e
  }
  const time = performance.now() - start
  return { output, error, time }
}

window.run_test = async ([test, expected]) => {
  const { output, error, time } = await run_string(test)
  return { ok: !error && eq(output, expected), output, error, time, test, expected }
}

window.run_tests = async (tests, { setup }) => {
  await run_string(setup)
  return await Promise.all(tests.map(async test => await run_test(test)))
}

if (typeof global !== 'undefined') {
  window.run_cli = async () => {
    const start = performance.now()
    const results = await run_tests(tests, { setup: setup.replace(/import (.*);?/, 'require($1)') })
    const time = performance.now() - start
    console.log(results.map((d, i) => d.ok ? null : [i + 1].concat(d.error ? d.error.message : [d.output, d.expected])).filter(d => d), `\x1b[1m\x1b[33m${~~(time * 1000)}ms\x1b[0m: \x1b[32m${results.filter(d => d.ok).length} passed\x1b[0m, \x1b[31m${results.filter(d => !d.ok).length} errored\x1b[0m`)
    if (results.some(d => !d.ok)) process.exit(1)
  }
  run_cli()
}
