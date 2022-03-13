#!/usr/bin/env node --inspect

import fs from 'fs'
import { deepStrictEqual } from 'assert'
import { performance } from 'perf_hooks'
import { spawn } from 'child_process'
const sound = k => spawn('afplay', [`/System/Library/Sounds/${k}.aiff`], { detached: true, stdio: 'ignore' }).unref()
const [ok, ko, crash] = ['Tink', 'Ping', 'Sosumi'].map(k => () => sound(k))
const [clear, red, green, yellow, blue] = [0, 31, 32, 33, 34].map(n => `\x1b[${n}m`)

let cache = 0
const run = async file => {
  try {
    const module = await import(file + '?cache=' + cache++)
    const start = performance.now()
    const results = await Promise.all(
      module.default.flatMap((scenario, index) =>
        Object.entries(scenario)
          .filter(([fname, fn]) => !['name', 'tests'].includes(fname))
          .flatMap(([fname, fn]) =>
            scenario.tests.map(async ({ input, output }) => {
              try {
                if (input instanceof Function) return deepStrictEqual(await input(fn), output)
                return deepStrictEqual(await fn(...input), output)
              } catch (error) {
                debugger
                return { index, fname, error }
              }
            }),
          ),
      ),
    )
    const time = performance.now() - start
    const passed = results.filter(v => !v)
    const errored = results.filter(v => v)
    if (errored.length) console.dir(errored)
    errored.length ? ko() : ok()
    // prettier-ignore
    console.log(`${blue}${file}${clear} | ${yellow}${time > 1000 ? +(time / 1000).toPrecision(2) + 's' : +time.toFixed(0) + 'ms'}${clear}: ${green}${passed.length} passed${clear}, ${red}${errored.length} errored${clear}`)
  } catch (error) {
    console.log(`${blue}${file}${clear} | ${red}${error.name}:${clear} ${error.message}`) // prettier-ignore
    crash()
  }
}

const cli = async () => {
  console.clear()
  const files = await fs.promises.readdir('.')
  files
    .filter(file => file.endsWith('.test.js'))
    .map(async file => {
      await run(`file://${process.cwd()}/${file}`)
      fs.watchFile(file, { interval: 100 }, async () => {
        console.clear()
        await run(`file://${process.cwd()}/${file}`)
      })
    })
}

cli()
