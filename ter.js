#!/usr/bin/env node

function equal(a, b) {
  class AssertionError extends Error {
    constructor(a, b, difference) {
      super()
      if (Error.captureStackTrace) Error.captureStackTrace(this, AssertionError)
      this.name = 'AssertionError'
      this.message = 'Expected values to be strictly deep-equal'
      this.actual = a
      this.expected = b
      this.difference = difference
    }
  }
  Object.difference = (a, b, p = []) => {
    if (a === b) return null
    if (a == null || b == null || a.__proto__ !== b.__proto__) return [a, b]
    if (![Object.prototype, Array.prototype].includes(a.__proto__)) return a.toString() === b.toString() ? null : [a, b]
    return Object.keys({ ...a, ...b }).reduce((acc, k) => {
      const difference = Object.difference(a[k], b[k], p.concat(k))
      if (!difference || !difference.length) return acc
      if (difference instanceof Array && (!difference[0] || !difference[0].path)) return acc.concat({ path: p.concat(k), difference })
      if (difference instanceof Array) return acc.concat(difference)
      if (difference instanceof Object) return difference
    }, [])
  }
  const difference = Object.difference(a, b)
  if (difference && difference.length) throw new AssertionError(a, b, difference)
  return true
}

async function run_test(test) {
  let error,
    time = 0
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
  } catch (e) {
    error = e
  }
  return { test, time, error }
}

async function download_suite(url) {
  return (await download(url))
    .split('\n')
    .reduce(
      (acc, v) => {
        acc.slice(-1)[0].push(v)
        if (v.includes('>>')) acc.push([])
        return acc
      },
      [[]],
    )
    .map(v =>
      v
        .join('\n')
        .trim()
        .replace(/^;/, ''),
    )
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
  console.log(`${blue}${url}${clear} | ${yellow}${time > 1000 ? +(time / 1000).toPrecision(2) + 's' : +time.toFixed(0) + 'ms'}${clear}: ${green}${passed.length} passed${clear}, ${red}${errored.length} errored${clear}, ${pink}${skipped.length} skipped${clear}`)
  return results
}

if (typeof global !== 'undefined') {
  global.window = global
  window.run_cli = async () => {
    const fs = await import('fs')
    const child_process = await import('child_process')
    const [ok, ko, crash] = ['Tink', 'Ping', 'Sosumi'].map(k => () => child_process.spawn('afplay', ['/System/Library/Sounds/' + k + '.aiff'], { detached: true, stdio: 'ignore' }).unref())
    // const equal = (await import('assert')).deepStrictEqual
    window.download = async file => await fs.promises.readFile(file, 'utf8')
    window.performance = (await import('perf_hooks')).performance

    const files = process.argv.length > 2 ? process.argv.slice(2) : (await fs.promises.readdir('.')).filter(file => /^test.*.js/.test(file))
    files.map(async file => {
      const run = async () => ((await run_suite(file)).some(v => v.error) ? ko() : ok())
      const watch = file => fs.watchFile(file, { interval: 100 }, run)
      // TEMP: waiting for equivalent of require.cache to be available in node esm (module._cache is always empty, maybe due to async import)
      const content = await fs.promises.readFile(file, 'utf8')
      const module_cache = content
        .split('\n')
        .filter(l => l.startsWith('import'))
        .map(l => l.replace(/import ([^'"]*)["']([^'"]*)['"]/g, (m, a, b) => b))
      module_cache.concat(file).map(watch)
      run()
    })
    // TODO: eval in sandbox for each test
    // const vm = await import('vm')
    // window.evil = code => vm.runInNewContext(code, Object.keys(global).filter(k => k !== 'global').reduce((acc, k) => (acc[k] = global[k], acc), {}))
  }
  run_cli()
}
// TODO: eval in sandbox for each test
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
// TEMP: waiting for API to invalidate module.cache > https://github.com/nodejs/help/issues/1399
window.download_cache = 0
window.download = async file => await (await fetch(file)).text()
window.download_suite = download_suite
window.run_suite = run_suite
window.run_test = run_test
