import './raw.js'
//>>

await (() => 1).wait(100) >> 1

let n = 0, inc = () => n++
await inc.every(100, 2) // immediate + 1 run
await (() => n).wait(400) >> 2

let n = 0, inc = () => n++
await inc.every(50).stop.wait(200) // immediate + run every 30ms + stop after 200ms
await (() => n).wait(300) >> 4

let n = 0, inc = (x => n += x).debounce(100)
inc(1) // delayed
n >> 0

let n = 0, inc = (x => n += x).debounce(100)
inc(1)
await (() => n).wait(500) >> 1

let n = 0, inc = (x => n += x).debounce(100)
inc(1) // skipped
inc(2) // skipped
inc(3)
await (() => n).wait(500) >> 3

let n = 0, inc = (x => n += x).throttle(100)
inc(1) // immediate
n >> 1

let n = 0, inc = (x => n += x).throttle(100)
inc(1)
await (() => n).wait(500) >> 1

let n = 0, inc = (x => n += x).throttle(100)
inc(1)
inc(2) // skipped
inc(3)
await (() => n).wait(500) >> 4

inc = async (n = 0, i, acc) => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return [n, i, acc]
}
await Promise.map([1, 2, 3, 4], inc) >> [2, 4]