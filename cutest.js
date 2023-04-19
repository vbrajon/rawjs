import { assertEquals, assertRejects } from "https://deno.land/std@0.127.0/testing/asserts.ts"
export function cutest(tests, pkg) {
  const c = {}
  const functions = []
  for (let test of tests) {
    if (test instanceof Array) test = {
      name: test[0],
      input: test.slice(1, -1),
      output: test.at(-1),
    }
    const { name, input, output } = test
    c[name] = (c[name] || 0) + 1
    const f = pkg.fn(pkg.module, name)
    if (!f) continue
    const run = `${name} #${c[name]} #${pkg.name}.${f.name}`
    const fn = test.fn ? () => test.fn(f) : () => f(...input)
    const fn_test = async () => assertEquals(await fn(), output)
    const fn_bench = async () => { try { await fn() } catch (e) {} } // prettier-ignore
    const fn_run = async (times = 1) => {
      try {
        await fn_test()
        const start = performance.now()
        for (let i = 0; i < times; i++) {
          await fn_bench()
        }
        const duration = performance.now() - start
        return ["ok", run, duration / times]
      } catch (e) {
        return ["ko", run, e]
      }
    }
    functions.push({ run, fn_run })
  }
  return functions
}
export async function run(file, options) {
  const { times = 1, parallel = false } = options || {}
  const { packages, default: tests } = await import('./' + file)
  const results = {}
  for (const pkg of packages || options.packages) {
    for (const version of pkg.versions) {
      const name = `${pkg.name}@${version}`
      pkg.module = await pkg.import(version)
      const functions = cutest(tests, pkg)
      const start = performance.now()
      results[name] = parallel ? await Promise.all(functions.map(({ fn_run }) => fn_run(times))) : await functions.reduce(async (acc, { fn_run }) => [...(await acc), await fn_run(times)], [])
      const duration = performance.now() - start
      const passed = results[name].filter(([status]) => status === "ok")
      const errored = results[name].filter(([status]) => status === "ko")
      const [clear, red, green, yellow, blue] = [0, 31, 32, 33, 34].map((n) => `\x1b[${n}m`)
      if (errored.length) console.table(errored)
      console[errored.length ? 'error' : 'log'](`${blue}${file} ${name}${clear} | ${yellow}${duration > 1000 ? +(duration / 1000).toPrecision(2) + "s" : +duration.toFixed(0) + "ms"}${times > 1 ? ` x${times}` : ''}${parallel ? ` parallel` : ''}${clear}: ${green}${passed.length} passed${clear}, ${red}${errored.length} errored${clear}`)
    }
  }
  return results
}
