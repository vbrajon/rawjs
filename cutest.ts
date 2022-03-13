import { assertEquals, assertRejects } from 'https://deno.land/std@0.127.0/testing/asserts.ts'

export default async function cutest(scenarios) {
  for await (const { name: scenario_name, tests, runs = 100, ...rest } of scenarios) {
    for await (const [test_num, { input, output, error }] of Object.entries(tests)) {
      for await (const [fn_name, f] of Object.entries(rest)) {
        const name = `${scenario_name} #${test_num} #${fn_name}`
        const fn = input instanceof Function ? async () => await input(f) : async () => await f(...input)
        const fn_test = error ? async () => assertRejects(await fn(), Error, error) : async () => assertEquals(await fn(), output)
        Deno.test(name, fn_test)
      }
    }
  }
}
