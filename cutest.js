#!/usr/bin/env node

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
          .filter(([fname, fn]) => fname !== 'tests')
          .flatMap(([fname, fn]) =>
            scenario.tests.map(async ({ inputs, output }) => {
              try {
                if (inputs instanceof Function) return deepStrictEqual(await inputs(fn), output)
                return deepStrictEqual(await fn(...inputs), output)
              } catch (error) {
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
    console.log(`${blue}${file}${clear} | ${yellow}${time > 1000 ? +(time / 1000).toPrecision(2) + 's' : +time.toFixed(0) + 'ms'}${clear}: ${green}${passed.length} passed${clear}, ${red}${errored.length} errored${clear}`) // eslint-disable-line
  } catch (error) {
    console.log(`${blue}${file}${clear} | ${red}${error.name}:${clear} ${error.message}`) // eslint-disable-line
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
