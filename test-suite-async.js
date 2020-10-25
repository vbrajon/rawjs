import './raw.js'
//>>

await (() => 1).wait(100) >> 1

let n = 0, inc = () => n++
inc.every(75, 5)
await (() => n).wait(500) >> 5

let n = 0, inc = (() => n++).debounce(100)
inc.every(75, 5)
await (() => n).wait(500) >> 1

let n = 0, inc = (() => n++).throttle(200)
inc.every(75, 5)
await (() => n).wait(500) >> 3

let n = 0, inc = (x => n += x).throttle(100)
inc(1)
inc(2) // skipped
inc(3)
await (() => n).wait(500) >> 4

let n = 0, inc = () => n++
inc.every() // loop
inc.stop.wait(50)
await (() => n > 10).wait(500) >> true
