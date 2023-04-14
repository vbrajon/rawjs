import { assertEquals, assertRejects } from "asserts"
export function cutest(scenarios, options) {
  const functions = []
  for (const { name: scenario_name, tests, ...rest } of scenarios) {
    if (tests instanceof Function) {
      for (const [fn_name, f] of Object.entries(rest).length ? Object.entries(rest) : Object.entries({ default: null }) ) {
        const name = `${scenario_name} #fn #${fn_name}`
        const fn_test = async () => await tests(f)
        const fn_bench = async () => await tests(f)
        const fn_run = async (times = 1) => {
          try {
            await fn_test()
            const start = performance.now()
            for (let i = 0; i < times; i++) {
              await fn_bench()
            }
            const duration = performance.now() - start
            return ["ok", name, duration / times]
          } catch (e) {
            return ["ko", name, e]
          }
        }
        functions.push({ name, fn_run })
      }
      continue
    }
    for (const [test_num, { input, output, error }] of Object.entries(tests)) {
      for (const [fn_name, f] of Object.entries(rest)) {
        const name = `${scenario_name} #${test_num} #${fn_name}`
        const fn = input instanceof Function ? async () => await input(f) : async () => await f(...input)
        const fn_test = error ? async () => assertRejects(await fn(), Error, error) : async () => assertEquals(await fn(), output)
        const fn_bench = error ? fn : async () => { try { await fn() } catch (e) {} } // prettier-ignore
        const fn_run = async (times = 1) => {
          try {
            await fn_test()
            const start = performance.now()
            for (let i = 0; i < times; i++) {
              await fn_bench()
            }
            const duration = performance.now() - start
            return ["ok", name, duration / times]
          } catch (e) {
            return ["ko", name, e]
          }
        }
        functions.push({ name, fn_run })
      }
    }
  }
  return functions
}
export async function run(file, options) {
  const { times = 1, parallel = false } = options || {}
  const scenarios = (await import('./' + file)).default
  const functions = cutest(scenarios)
  const start = performance.now()
  const results = parallel ? await Promise.all(functions.map(({ fn_run }) => fn_run(times))) : await functions.reduce(async (acc, { fn_run }) => [...(await acc), await fn_run(times)], [])
  const duration = performance.now() - start
  const passed = results.filter(([status]) => status === "ok")
  const errored = results.filter(([status]) => status === "ko")
  const [clear, red, green, yellow, blue] = [0, 31, 32, 33, 34].map((n) => `\x1b[${n}m`)
  if (errored.length) console.table(errored)
  console[errored.length ? 'error' : 'log'](`${blue}${file}${clear} | ${yellow}${duration > 1000 ? +(duration / 1000).toPrecision(2) + "s" : +duration.toFixed(0) + "ms"}${times > 1 ? ` x${times}` : ''}${parallel ? ` parallel` : ''}${clear}: ${green}${passed.length} passed${clear}, ${red}${errored.length} errored${clear}`)
  return results
}
