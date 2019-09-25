import './raw.js'
raw()

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
