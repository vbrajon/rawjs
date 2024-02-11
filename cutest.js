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
      if (errored.length) {
        const assertErrors = errored.filter((v) => v.error.name === "AssertError").map((v) => ({ run: v.run, actual: v.error.actual, expected: v.error.expected }))
        const throwErrors = errored.filter((v) => v.error.name !== "AssertError").map((v) => v.error)
        if (assertErrors.length) console.table(assertErrors)
        if (throwErrors.length) throwErrors.map(e => console.error(e))
      }
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
      const [key, description] = name.split(" - ")
      c[key] = (c[key] || 0) + 1
      const f = pkg.fn(pkg.module, key)
      if (!f) continue
      const run = `${key} #${c[key]} #${pkg.name}`
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
      if (name === "Object.map") return (...args) => (args[0].constructor === Object ? module.mapValues(...args) : module.map(...args))
      if (name === "Object.filter") return (...args) => (args[0].constructor === Object ? module.pickBy(...args) : module.filter(...args))
      if (name === "Object.find") return module.find
      if (name === "Object.findIndex") return module.findKey
      if (name === "Object.reduce") return module.reduce
      // if (name === "Object.access") return module.get
      // if (name === "Object.equal") return module.isEqual
      if (name === "String.lower") return module.toLower
      if (name === "String.upper") return module.toUpper
      if (name === "String.capitalize") return module.capitalize
      if (name === "String.words") return module.words
      // if (name === "Function.decorate") return module.flow
      // if (name === "Function.promisify") return module.bind
      // if (name === "Function.partial") return module.partial
      // if (name === "Function.memoize") return module.memoize
      // if (name === "RegExp.escape") return module.escapeRegExp
    },
  },
]
// await new Promise((resolve) => setTimeout(resolve, 1000))
const results = [
  // NOTE: Safari crashes when running more test functions, more times
  // await run("cut-async.test.js", { parallel: true, packages: packages.slice(0, 1) }),
  // await run("cut-sync.test.js", { parallel: true, packages }),
  // await run("cut-sync.test.js", { parallel: true, times: 100, packages }),
  await run("cut-core.test.js", { parallel: true }),
]
  .map(Object.values)
  .flat(2)
if (results.find(({ status }) => status === "ko")) throw "KO"
