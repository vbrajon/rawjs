#!/usr/bin/env node

import { deepStrictEqual } from 'assert'
import fs from 'fs'
import { performance } from 'perf_hooks'
import { spawn } from 'child_process'
const [ok, ko, crash] = ['Tink', 'Ping', 'Sosumi'].map(k => () => spawn('afplay', ['/System/Library/Sounds/' + k + '.aiff'], { detached: true, stdio: 'ignore' }).unref()) // eslint-disable-line

let cache = 0
const run = async file => {
  const tests = await import('./' + file + '?cache=' + cache++)
  const start = performance.now()
  const results = await Promise.all(
    tests.default.flatMap((test, index) =>
      Object.entries(test)
        .filter(([fname, fn]) => fname !== 'tests')
        .flatMap(([fname, fn]) =>
          test.tests.map(async ([input, output]) => {
            try {
              if (input instanceof Function) return deepStrictEqual(await input(fn), output)
              return deepStrictEqual(await fn(...input), output)
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
  const [clear, red, green, yellow, blue] = [0, 31, 32, 33, 34].map(n => `\x1b[${n}m`)
  if (errored.length) console.dir(errored)
  errored.length ? ko() : ok()
  console.log(`${blue}${file}${clear} | ${yellow}${time > 1000 ? +(time / 1000).toPrecision(2) + 's' : +time.toFixed(0) + 'ms'}${clear}: ${green}${passed.length} passed${clear}, ${red}${errored.length} errored${clear}`) // eslint-disable-line
}

const cli = async () => {
  const files = await fs.promises.readdir('.')
  const testFiles = files.filter(file => file.endsWith('.test.js'))
  const runTests = async () => {
    try {
      console.clear()
      await Promise.all(testFiles.map(run))
    } catch (e) {
      console.log(e)
      crash()
    }
  }
  files.map(file => fs.watchFile(file, { interval: 100 }, runTests))
  runTests()
}

cli()
