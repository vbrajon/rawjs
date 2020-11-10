import './raw.js'
//>>

await (() => 1).wait(100) >> 1

let n = 0, inc = () => n++
inc.every(100, 3)
await (() => n).wait(500) >> 3

let n = 0, inc = (x => n += x).debounce(100)
inc(1) // skipped
inc(2) // skipped
inc(3)
await (() => n).wait(500) >> 3

let n = 0, inc = (x => n += x).throttle(100)
inc(1)
inc(2) // skipped
inc(3)
await (() => n).wait(500) >> 4

let n = 0, inc = () => n++
inc.every()
inc.stop.wait(100)
await (() => n > 1).wait(500) >> true
