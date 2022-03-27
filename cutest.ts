import { assertEquals, assertRejects } from 'https://deno.land/std@0.127.0/testing/asserts.ts'

try { Deno.bench('null', {}, () => null) } catch (e) { import.meta.test = true } // prettier-ignore
export default async function cutest(scenarios) {
  for await (const { name: scenario_name, tests, runs = 100, ...rest } of scenarios) {
    for await (const [test_num, { input, output, error }] of Object.entries(tests)) {
      for await (const [fn_name, f] of Object.entries(rest)) {
        const name = `${scenario_name} #${test_num} #${fn_name}`
        const fn = input instanceof Function ? async () => await input(f) : async () => await f(...input)
        const fn_test = error ? async () => assertRejects(await fn(), Error, error) : async () => assertEquals(await fn(), output)
        Deno.test(name, fn_test)

        const fn_try = async () => { try { await fn() } catch (e) {} } // prettier-ignore
        const fn_bench = error ? fn : fn_try
        if (!import.meta.test) Deno.bench(name, {}, fn_bench)
        // TODO: save benchmark results per git commit hash or git tag and compare with previous results
        // TODO: test with big datasets

        // TODO: add function size in bytes ok kb + number of dependencies
        // https://github.com/pastelsky/bundlephobia / https://github.com/iyowei/js-module-dependencies-to-be-installed / https://github.com/dependents/node-precinct
      }
    }
  }
}
