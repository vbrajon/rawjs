import './raw.js'
Object.extend(true)

// 1 //
await (() => 1).wait(100)

// 5 //
let n = 0, inc = () => n++
inc.every(50, 5)
await (() => n).wait(500)

// 1 //
let n = 0, inc = () => n++
inc.debounce(75).every(50, 5)
await (() => n).wait(500)

// 3 //
let n = 0, inc = () => n++
inc.throttle(75).every(50, 5)
await (() => n).wait(500)

// true //
let n = 0, inc = () => n++
inc.every()
inc.stop.wait(10)
inc.debounce()
inc.throttle()
await (() => n > 0).wait(500)
