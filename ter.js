#!/usr/bin/env node --no-warnings
Promise.map = async (arr, fn) => await arr.reduce(async (acc, v) => ((await acc).push(await fn(v)), acc), Promise.resolve([]))

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
    test = test
      .replace(/import ([^'"]*)["']([^'"]*)['"]/g, (m, a, b) => `${a.trim() ? `window.${a.replace(/(.* as )?(.* from )/, (m, a, b) => b.slice(0, -5).trim())} = ` : ''}(await import("${b}?cache=${++download_cache}")).default`)
      .replace(/(^|\n)const (\w+\s*=)/g, '$1window.$2')
    const [left, right] = test.split('>>')
    const code = left.replace(/;?(.*)\s*$/, 'return $1')
    const start = performance.now()
    const output = await eval(`(async () => {\n${code}\n})()`)
    time = performance.now() - start
    if (test.split('\n').every(l => l.startsWith('//'))) return {}
    const expected = await eval(`(async () => {\nreturn ${right}\n})()`)
    equal(output, expected)
  } catch(e) {
    error = e
  }
  return { test, time, error }
}

async function download_suite(url) {
  return (await download(url))
    .split('\n')
    .reduce((acc, v) => {
      acc.slice(-1)[0].push(v)
      if (v.includes('>>')) acc.push([])
      return acc
    }, [[]])
    .map(v => v.join('\n').trim().replace(/^;/, ''))
    .filter(x => x)
}

async function run_suite(url) {
  const tests = await download_suite(url)
  const start = performance.now()
  await run_test(tests[0])
  const results = await Promise.all(tests.slice(1).map(run_test))
  const time = performance.now() - start
  const passed = results.filter(v => v.test && !v.error)
  const skipped = results.filter(v => !v.test)
  const errored = results.filter(v => v.error)
  const [clear, red, green, yellow, blue, pink] = [0, 31, 32, 33, 34, 35].map(n => `\x1b[${n}m`)
  if (errored.length) console.dir([errored], { depth: null })
  console.log(`${blue}${url}${clear} | ${yellow}${time > 1000 ? +(time / 1000).toPrecision(2) + 's' : +(time).toPrecision(2) + 'ms'}${clear}: ${green}${passed.length} passed${clear}, ${red}${errored.length} errored${clear}, ${pink}${skipped.length} skipped${clear}`)
  return results
}

if (typeof global !== 'undefined') {
  global.window = global
  window.run_cli = async () => {
    const fs = await import('fs')
    const vm = await import('vm')
    const child_process = await import('child_process')
    const equal = (await import('assert')).deepStrictEqual
    const [ok, ko, crash] = ['Bottle', 'Ping', 'Sosumi'].map(k => () => child_process.spawn('afplay', ['/System/Library/Sounds/' + k + '.aiff'], { detached: true, stdio: 'ignore' }).unref())
    const options = process.argv.slice(2).filter(v => v.startsWith('--')).reduce((acc, v) => (acc[v.slice(2)] = true, acc), {})
    const file = process.argv.slice(2).find(v => !v.startsWith('--')) || 'test-suite.js'
    const run = async () => (await run_suite(file)).some(v => v.error) ? ko() : ok()
    const watch = file => fs.watchFile(file, { interval: 100 }, run)
    window.download = async file => fs.promises.readFile(file, 'utf8')
    window.performance = (await import('perf_hooks')).performance
    // TODO: eval in sandbox for each test
    // window.evil = code => vm.runInNewContext(code, Object.keys(global).filter(k => k !== 'global').reduce((acc, k) => (acc[k] = global[k], acc), {}))
    await run()
    // TEMP: waiting for equivalent of require.cache to be available in node esm (module._cache is always empty, maybe due to async import)
    window.module_cache = fs.readFileSync(file, 'utf8').split('\n').filter(v => v.startsWith('import')).map(l => l.replace(/import ([^'"]*)["']([^'"]*)['"]/g, (m, a, b) => b))
    window.module_cache.concat(file).map(watch)
  }
  run_cli()
}
// TEMP: waiting for API to invalidate module.cache > https://github.com/nodejs/help/issues/1399
window.download_cache = 0
// window.evil = async code => {
//   const iframe = document.createElement('iframe')
//   iframe.style.display = 'none'
//   document.body.appendChild(iframe)
//   const iwin = iframe.contentWindow
//   const ieval = iwin.eval.bind(iwin)
//   try {
//     return await ieval(code)
//   } finally {
//     document.body.removeChild(iframe)
//   }
// }
window.download = async file => await (await fetch(file)).text()
window.download_suite = download_suite
window.run_suite = run_suite
window.run_test = run_test
