function equal(a, b) {
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
  if (!eq(a, b)) throw new AssertionError(a, b)
  return true
}

async function run_test(test) {
  let output, expected, error
  const start = performance.now()
  try {
    const fn = eval('(async function eval_string() {\n' + test.replace(/(.*)\s*$/, 'return $1') + '\n})')
    output = await fn()
    if (test.match(/^\/\/(.*)\/\//)) {
      expected = eval('(' + (test.match(/^\/\/(.*)\/\//)[1] || 'null') + ')')
      equal(output, expected)
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

async function run_file(url, download = async file => await (await fetch(file)).text()) {
  const tests = (await download(url))
    .replace(/import([^'"]*)["']([^'"]*)['"]/g, (m, a, b) => `${a.trim() ? `window.${a.replace(/(.* as )?(.* from )/, (m, a, b) => b.slice(0, -5).trim())} = ` : ''}await import("${b}")`)
    .replace(/(^|\n)(\w+\s*=)/g, '$1window.$2')
    .split('\n\n')
    .filter(t => !t.trim().split('\n').every(l => l.startsWith('//')))
  const setup = await run_test(tests[0])
  if (setup.error) throw setup.error
  const start = performance.now()
  const results = await run_tests(tests.slice(1))
  const time = performance.now() - start
  if (results.some(d => d.error)) console.log(results.filter(d => d.error))
  const [clear, red, green, yellow] = [0, 31, 32, 33].map(n => `\x1b[${n}m`)
  console.log(`${yellow}${~~(time)}ms${clear}: ${green}${results.filter(d => !d.error).length} passed${clear}, ${red}${results.filter(d => d.error).length} errored${clear}`)
  if (results.some(d => d.error)) throw `Test suite ${url} errored`
  return { tests, results }
}

if (typeof global !== 'undefined') {
  window = global
  window.performance = { now: () => +process.hrtime().join('.') * 1000 }
  window.equal = require('assert').deepStrictEqual
  window.download = async file => (await require('fs').promises.readFile(file, 'utf-8')).replace(/import([^'"]*)["']([^'"]*)['"]/g, (m, a, b) => `${a.trim() ? `window.${a.replace(/(.* as )?(.* from )/, (m, a, b) => b.slice(0, -5).trim())} = ` : ''}require("${b}")`)
  run_file(process.argv[2] || 'test-suite.js', download).catch(e => (console.error(e), process.exit(1)))
}
if (window.Deno) {
  window.download = async file => {
    window.equal = (await import('https://deno.land/std/testing/asserts.ts')).equal
    return new TextDecoder('utf-8').decode(Deno.readFileSync(file))
  }
  run_file(Deno.args[1] || 'test-suite.js', download).catch(e => (console.error(e), Deno.exit(1)))
}
window.run_test = run_test
window.run_tests = run_tests
window.run_file = run_file
