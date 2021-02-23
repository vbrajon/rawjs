import { deepStrictEqual } from 'assert'
import fs from 'fs'
import { performance } from 'perf_hooks'
import { spawn } from 'child_process'
const [ok, ko, crash] = ['Tink', 'Ping', 'Sosumi'].map(k => () => spawn('afplay', ['/System/Library/Sounds/' + k + '.aiff'], { detached: true, stdio: 'ignore' }).unref())

let cache = 0
const run = async file => {
  const chunk = (arr, size) => Array(Math.ceil(arr.length / size)).fill().map((_, i) => arr.slice(i * size, i * size + size))
  const testFile = await import('./' + file + '?cache=' + cache++)
  const tests = chunk(testFile.default, 2)
  const start = performance.now()
  const results = await Promise.all(tests
    .map(async ([test, output], i) => {
      try {
        deepStrictEqual(await test(), output)
      } catch (e) {
        return { i, e }
      }
      return null
    }))
  const time = performance.now() - start
  const passed = results.filter(v => !v)
  const errored = results.filter(v => v)
  const [clear, red, green, yellow, blue] = [0, 31, 32, 33, 34].map(n => `\x1b[${n}m`)
  if (errored.length) console.dir(errored)
  errored.length ? ko() : ok()
  console.log(`${blue}${file}${clear} | ${yellow}${time > 1000 ? +(time / 1000).toPrecision(2) + 's' : +time.toFixed(0) + 'ms'}${clear}: ${green}${passed.length} passed${clear}, ${red}${errored.length} errored${clear}`)
}

const cli = async () => {
  const files = await fs.promises.readdir('.')
  const testFiles = files.filter(file => file.endsWith('.test.js'))
  const runTests = async () => {
    try {
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
