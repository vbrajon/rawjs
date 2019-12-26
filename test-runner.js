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
    if (![Object.prototype.toString, Array.prototype.toString].includes(a.toString)) return a === b || a.toString() === b.toString()
    if (Object.keys(a).length !== Object.keys(b).length) return false
    return Object.keys(a).every(k => a[k] === a || eq(a[k], b[k]))
  }
  if (!eq(a, b)) throw new AssertionError(a, b)
  return true
}

async function run_test(test) {
  let error, time = 0
  try {
    const fn = eval('(async function eval_string() {\n' + test.replace(/(.*)\s*$/, 'return $1') + '\n})')
    const start = performance.now()
    const output = await fn()
    time = performance.now() - start
    if (!test.match(/^\/\/(.*)\/\//) || test.split('\n').every(l => l.startsWith('//'))) return {}
    const expected = eval('(' + (test.match(/^\/\/(.*)\/\//)[1] || 'null') + ')')
    equal(output, expected)
  } catch(e) {
    error = e
  }
  return { test, time, error }
}

async function run_performance(test) {
  const tests = []
  const start = performance.now()
  while (performance.now() - start < 1000) tests.push(await run_test(test))
  const time = performance.now() - start
  console.log(test.split('\n').slice(-1)[0], +tests.length.toPrecision(1))
  return { test, time, error: (tests.find(t => t.error) || {}).error, runs: tests.length }
}

Promise.map = async (arr, fn) => await arr.reduce(async (acc, v) => ((await acc).push(await fn(v)), acc), Promise.resolve([]))
async function run_tests(tests) {
  if (window.perf) return [await run_test(tests[0]), await Promise.map(tests.slice(1), run_performance)].flat()
  return [await run_test(tests[0]), await Promise.all(tests.slice(1).map(run_test))].flat()
}

async function download_tests(url, download = window.download || (async file => await (await fetch(file)).text())) {
  return (await download(url))
    .replace(/import ([^'"]*)["']([^'"]*)['"]/g, (m, a, b) => `${a.trim() ? `window.${a.replace(/(.* as )?(.* from )/, (m, a, b) => b.slice(0, -5).trim())} = ` : ''}(await import("${b}")).default`)
    .replace(/(^|\n)(\w+\s*=)/g, '$1window.$2')
    .split('\n\n')
    .map(t => t.trim())
}

async function run_file(url) {
  const tests = await download_tests(url)
  const start = performance.now()
  const results = await run_tests(tests)
  const time = performance.now() - start
  const passed = results.filter(d => d.test && !d.error)
  const skipped = results.filter(d => !d.test)
  const errored = results.filter(d => d.error)
  const [clear, red, green, yellow, blue, pink] = [0, 31, 32, 33, 34, 35].map(n => `\x1b[${n}m`)
  if (errored.length) console.dir([errored], { depth: null })
  console.log(`${blue}${url}${clear} | ${yellow}${time > 1000 ? +(time / 1000).toPrecision(2) + 's' : +(time).toPrecision(2) + 'ms'}${clear}: ${green}${passed.length} passed${clear}, ${red}${errored.length} errored${clear}, ${pink}${skipped.length - 1} skipped${clear}`)
  return results
}

if (typeof global !== 'undefined') {
  const [ok, ko, crash] = ['Bottle', 'Ping', 'Sosumi'].map(k => () => require('child_process').spawn('afplay', ['/System/Library/Sounds/' + k + '.aiff'], { detached: true, stdio: 'ignore' }).unref())
  const options = process.argv.slice(2).filter(d => d.startsWith('--')).reduce((acc, v) => (acc[v.slice(2)] = true, acc), {})
  const files = process.argv.slice(2).filter(d => !d.startsWith('--'))
  window = global
  window.perf = options.perf || options.performance || options.benchmark
  window.performance = require('perf_hooks').performance
  window.equal = require('assert').deepStrictEqual
  window.download = async file => require('fs').promises.readFile(file, 'utf-8')
  window.watch = file => require('fs').watch(file, () => require('child_process').execSync([process.argv[0], '-r esm'].concat(process.argv.slice(1)).join(' ').replace('--watch', '--child'), { stdio: 'inherit', cwd: process.cwd() }))
  window.run_cli = async () => {
    const results = (await Promise.map(files, run_file)).flat()
    results.some(d => d.error) ? ko() : ok()
    if (options.child) return
    if (options.watch) Object.keys(require('module')._cache).concat(files).filter(f => !/esm.js$/.test(f)).map(watch)
    else results.some(d => d.error) && process.exit(1)
  }
  run_cli()
}
window.run_test = run_test
window.run_tests = run_tests
window.download_tests = download_tests
window.run_file = run_file
