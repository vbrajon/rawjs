if (!globalThis.window) globalThis.window = globalThis
window.process = window.process || {}
async function run(file, options) {
  const {
    times = 1,
    parallel = false,
    assertEquals = (a, b) => {
      const sa = JSON.stringify(a)
      const sb = JSON.stringify(b)
      if (sa === sb) return
      const error = new Error(`${sa} !== ${sb}`)
      error.name = "AssertError"
      error.actual = a
      error.expected = b
      throw error
    },
  } = options || {}
  const { packages, default: tests } = await import("./" + file)
  const results = {}
  for (const pkg of packages || options.packages) {
    for (const version of pkg.versions) {
      const name = `${pkg.name}@${version}`
      pkg.module = await pkg.import(version)
      const functions = prepare(tests, pkg)
      const start = performance.now()
      results[name] = parallel ? await Promise.all(functions.map(({ fn_run }) => fn_run(times))) : await functions.reduce(async (acc, { fn_run }) => [...(await acc), await fn_run(times)], [])
      const duration = performance.now() - start
      const passed = results[name].filter(({ status }) => status === "ok")
      const errored = results[name].filter(({ status }) => status === "ko")
      const skipped = tests.length - results[name].length
      const [clear, red, green, yellow, blue] = [0, 31, 32, 33, 34].map((n) => `\x1b[${n}m`)
      if (errored.length) console.table(errored.map((v) => ({ run: v.run, error: v.error.name, message: v.error.message, input: v.input, actual: v.error.actual, expected: v.error.expected })))
      console[errored.length ? "error" : "log"](`${file} ${blue}${name}${clear} | ${yellow}${duration > 1000 ? +(duration / 1000).toPrecision(2) + "s" : +duration.toFixed(0) + "ms"}${times > 1 ? ` x${times}` : ""}${parallel ? ` parallel` : ""}${clear}: ${green}${passed.length} passed${clear}, ${red}${errored.length} errored${skipped ? `, ${yellow}${skipped} skipped${clear}` : ""}${clear}`)
    }
  }
  return results
  function prepare(tests, pkg) {
    const c = {}
    const functions = []
    for (let test of tests) {
      if (test instanceof Array)
        test = {
          name: test[0],
          input: test.slice(1, -1),
          output: test.at(-1),
        }
      const { name, input, output } = test
      c[name] = (c[name] || 0) + 1
      const f = pkg.fn(pkg.module, name)
      if (!f && !test.force) continue
      const run = `${name} #${c[name]} #${pkg.name}`
      const fn = test.fn ? () => test.fn(f) : () => f(...input)
      const fn_test = async () => assertEquals(await fn(), output)
      const fn_bench = async () => { try { await fn() } catch (e) {} } // prettier-ignore
      const fn_run = async (times = 1) => {
        try {
          await fn_test()
          const start = performance.now()
          for (let i = 0; i < times; i++) await fn_bench()
          const duration = performance.now() - start
          return { status: "ok", run, duration: duration / times }
        } catch (error) {
          return { error, status: "ko", run, input, output }
        }
      }
      functions.push({ run, fn_run })
    }
    return functions
  }
}

const registry = "https://registry.npmjs.org/"
const unpkg = process.title === "bun" ? "" : "https://unpkg.com/"
const esm = process.title === "bun" ? "" : "https://esm.sh/"
const versionList = async (pkg) => Object.keys((await (await fetch(registry + pkg)).json()).versions).reverse()
const packages = [
  {
    name: "cut",
    versions: ["latest"],
    import: (version) => import(`./cut.js`),
    fn: (module, name) => {
      const [constructor, fname] = name.split(".")
      return module.default[constructor][fname]
    },
  },
  {
    name: "vanilla",
    versions: ["es2022"],
    import: (version) => import(`${esm}@js-temporal/polyfill`),
    fn: (module, name) => {
      const { Temporal } = module
      return {
        "Object.map": (obj, fn) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fn(v, k, obj)])),
        "Object.filter": (obj, fn) => Object.fromEntries(Object.entries(obj).filter(([k, v]) => fn(v, k, obj))),
        "Object.find": (obj, fn) => obj[Object.keys(obj).find((k, i, ks) => fn(obj[k], k, obj, i, ks))],
        "Object.findIndex": (obj, fn) => Object.keys(obj).find((k, i, ks) => fn(obj[k], k, obj, i, ks)),
        "Array.reduce": (arr, ...args) => arr.reduce(...args),
        "Date.getWeek": (date) => Temporal.PlainDate.from({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() }).weekOfYear,
      }[name]
    },
  },
  {
    name: "lodash-es",
    versions: (await versionList("lodash-es"))
      .filter((v) => v.startsWith("4"))
      .reverse()
      .slice(-1),
    import: (version) => import(`${unpkg}lodash-es@${version}`),
    fn: (module, name) => {
      const mapping = {
        // "Object.map": "map",
        // "Object.filter": "filter",
        "Object.find": "find",
        "Object.findIndex": "findKey",
        "Object.reduce": "reduce",
        // "Object.access": "get",
        // "Object.equal": "isEqual",
        "String.lower": "toLower",
        "String.upper": "toUpper",
        "String.capitalize": "capitalize",
        "String.words": "words",
        // "Function.decorate": "flow",
        // "Function.promisify": "bind",
        // "Function.partial": "partial",
        // "Function.memoize": "memoize",
        // "RegExp.escape": "escapeRegExp",
      }
      return module[mapping[name]]
    },
  },
]
const results = [
  // NOTE: Safari crashes when running more test functions, more times
  await run("cut-async.test.js", { parallel: true, packages: packages.slice(0, 1) }),
  await run("cut-core.test.js", { parallel: true }),
  await run("cut-bench.test.js", { times: 100, packages: packages.slice(0, 1) }),
]
  .map(Object.values)
  .flat(2)
if (results.find(({ status }) => status === "ko")) throw "KO"
