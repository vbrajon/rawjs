import cut from "cut"

const scenarios = [
  {
    name: "Function.wait",
    fn: async () => {
      const start = Date.now()
      const n = await cut.Function.wait(() => 1, 100)
      if (Date.now() - start < 100) throw new Error("Function.wait should wait 100ms")
      if (n !== 1) throw new Error("Function.wait should resolve the function and return 1")
    },
  },
  {
    name: "Function.every - limit",
    fn: async () => {
      let n = 0
      const loop = cut.Function.every(() => n++, 100, 3) // immediate + runs every 100ms + stops after 3 times
      if (n !== 1) throw new Error(`Function.every should have been called immediately, n = ${n}`)
      await loop
      // if (n !== 2) throw new Error(`Function.every should yield next result and be called 2 times, n = ${n}`)
      // await loop
      // if (n !== 3) throw new Error(`Function.every should have been called 3 times, n = ${n}`)
      // await loop
      // if (n !== 3) throw new Error(`Function.every should have been called 3 times, n = ${n}`)
    },
  },
  {
    name: "Function.every - stop",
    fn: async () => {
      let n = 0
      const loop = cut.Function.every(() => n++, 100)
      await cut.Function.wait(loop.stop, 280) // immediate + runs every 100ms + stops after 250ms
      if (n !== 3) throw new Error(`Function.every should have been called 3 times, n = ${n}`)
    },
  },
  {
    name: "Function.debounce",
    fn: async () => {
      let n = 0
      const inc = cut.Function.debounce((x) => (n += x), 100)
      inc(1) // skipped
      inc(2) // skipped
      inc(3) // delayed
      if (n !== 0) throw new Error(`Function.debounce should wait before calling the fn, n = ${n}`)
      await cut.Function.wait(() => null, 100)
      if (n !== 3) throw new Error(`Function.debounce should call the fn after 100ms, n = ${n}`)
    },
  },
  {
    name: "Function.throttle",
    fn: async () => {
      let n = 0
      const inc = cut.Function.throttle((x) => (n += x), 100)
      inc(1) // immediate
      inc(2) // skipped
      inc(3) // planned
      if (n !== 1) throw new Error(`Function.throttle should call immediatly the fn, n = ${n}`)
      await cut.Function.wait(() => null, 100)
      if (n !== 4) throw new Error(`Function.throttle should have called the next fn after 100ms, n = ${n}`)
      await cut.Function.wait(() => null, 100)
    },
  },
  {
    name: "Promise.map",
    fn: async () => {
      let n = 0
      const inc = (x) => new Promise((resolve) => setTimeout(() => resolve((n += x)), 100))

      const all = await Promise.all([1, 2].map(inc))
      if (n !== 3) throw new Error(`Promise.all should be awaitable, n = ${n}`)
      if (all.length !== 2) throw new Error(`Promise.all should return 2 elements`)
      n = 0

      const map = await cut.Promise.map([1, 2], inc)
      if (n !== 3) throw new Error(`Promise.map should be awaitable, n = ${n}`)
      if (map.length !== 2) throw new Error(`Promise.map should return 2 elements`)
      n = 0

      cut.Promise.map([1, 2], inc)
      if (n !== 0) throw new Error(`Promise.map should start the first promise, n = ${n}`)
      await cut.Function.wait(() => null, 120)
      if (n !== 1) throw new Error(`Promise.map should start the second promise, n = ${n}`)
      await cut.Function.wait(() => null, 120)
      if (n !== 3) throw new Error(`Promise.map should be done, n = ${n}`)
    },
  },
]

export default scenarios

if (import.meta.main !== undefined) (await import("cutest")).default(scenarios)
