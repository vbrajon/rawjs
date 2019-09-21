async function run_test(test) {
  let output, expected, error
  const start = performance.now()
  try {
    const fn = eval('(async function eval_string() {\n' + test.replace(/(.*)\s*$/, 'return $1') + '\n})')
    output = await fn()
    if (test.match(/\/\/(.*)\/\//)) {
      expected = eval('(' + (test.match(/\/\/(.*)\/\//)[1] || 'null') + ')')
      assert_eq(output, expected)
    }
  } catch(e) {
    error = e
  }
  const time = performance.now() - start
  return { test, time, output, expected, error }
}

async function run_tests(tests) {
  return await Promise.all(tests.map(async test => await run_test(test)))
}

if (typeof global !== 'undefined') {
  window = global
  window.performance = { now: () => +process.hrtime().join('.') * 1000 }
  window.assert_eq = require('assert').deepStrictEqual
  async function run_cli() {
    const tests = (await require('fs').promises.readFile('test-suite-raw.js', 'utf-8'))
      .split('\n\n')
      .filter(t => !/\/\/.*\s*$/.test(t))
      .map(t => t.replace(/import (.*);?/, 'require($1)'))
    const start = performance.now()
    const results = await run_tests(tests)
    const time = performance.now() - start
    if (results.some(d => d.error)) console.log(results.filter(d => d.error).map(d => [d.test, d.error]))
    console.log(`\x1b[34m${~~(time)}ms\x1b[0m: \x1b[32m${results.filter(d => !d.error).length} passed\x1b[0m, \x1b[31m${results.filter(d => d.error).length} errored\x1b[0m`)
    if (results.some(d => d.error)) process.exit(1)
  }
  run_cli()
} else {
  class AssertionError extends Error {
    constructor(a, b) {
      super()
      if (Error.captureStackTrace) Error.captureStackTrace(this, AssertionError)
      this.name = 'AssertionError'
      this.message = 'Expected values to be strictly deep-equal'
      this.actual = a
      this.expected = b
    }
  }
  function eq(a, b) {
    if (a == null || b == null) return a === b
    if (a.__proto__ !== b.__proto__) return false
    if (!['Object', 'Array'].includes(Object.prototype.toString.call(a).slice(8, -1))) return a === b || a.toString() === b.toString()
    if (Object.getOwnPropertyNames(a).length !== Object.getOwnPropertyNames(b).length) return false
    return Object.getOwnPropertyNames(a).every(k => eq(a[k], b[k]))
  }
  window.assert_eq = (a, b) => {
    if (!eq(a, b)) throw new AssertionError(a, b)
    return true
  }
  async function run_browser() {
    const tests = (await (await fetch('/test-suite-raw.js')).text())
      .split('\n\n')
      .filter(t => !/\/\/.*\s*$/.test(t))
      .map(t => t.replace(/import (.*);?/g, 'await import($1)'))
      .map(t => t.replace(/(^|\n)(\w+\s*=)/g, '$1window.$2'))
    await run_test(tests[0]) // HACK: Setup test needs to be run first because tests are parallelized and import is async here
    window.dispatchEvent(new CustomEvent('runner', { detail: { tests }})) // HACK: Send info to vue
    const start = performance.now()
    const results = await run_tests(tests)
    const time = performance.now() - start
    if (results.some(d => d.error)) console.log(results.filter(d => d.error).map(d => [d.test, d.error]))
    console.log(`\x1b[34m${~~(time)}ms\x1b[0m: \x1b[32m${results.filter(d => !d.error).length} passed\x1b[0m, \x1b[31m${results.filter(d => d.error).length} errored\x1b[0m`)
    return results
  }
  window.run_test = run_test
  window.run_tests = run_tests
  run_browser()
}
