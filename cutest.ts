import { assertEquals, assertRejects } from "https://deno.land/std@0.127.0/testing/asserts.ts"

try { Deno.bench('null', {}, () => null) } catch (e) { import.meta.test = true } // prettier-ignore
export default async function cutest(scenarios) {
  for await (const { name: scenario_name, tests, runs = 100, ...rest } of scenarios) {
    for await (const [test_num, { input, output, error }] of Object.entries(tests || [{ input: [], output: undefined }])) {
      for await (const [fn_name, f] of Object.entries(rest)) {
        const name = `${scenario_name} #${test_num} #${fn_name}`
        const fn = input instanceof Function ? async () => await input(f) : async () => await f(...input)
        const fn_test = error ? async () => assertRejects(await fn(), Error, error) : async () => assertEquals(await fn(), output)
        Deno.test(name, fn_test)

        const fn_try = async () => { try { await fn() } catch (e) {} } // prettier-ignore
        const fn_bench = error ? fn : fn_try
        if (!import.meta.test) Deno.bench(name, {}, fn_bench)
        // TODO: save benchmark results per version (git hash or git tag)
        // TODO: AND compare with previous benchmarks
        // TODO: OR run benchmark for all versions
        // TODO: test with big datasets

        // TODO: add function size in bytes ok kb + number of dependencies
        // TODO: track when function changes between versions
        // https://github.com/pastelsky/bundlephobia > https://github.com/pastelsky/package-build-stats
        // https://bundlephobia.com/package/lodash-es@4.17.21 // find = 6.2kB gzip
        // npm info lodash --json
        // deno info https://esm.sh/lodash-es/find?no-check
        // deno info https://cdn.esm.sh/v74/lodash-es@4.17.21/deno/lodash-es.js?no-check --json
        // curl https://cdn.esm.sh/v74/lodash-es@4.17.21/es2015/find.js | wc -c
      }
    }
  }
}
