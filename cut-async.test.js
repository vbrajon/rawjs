import './cut.js'

const tests = [
  [async () => await Function.wait(() => 1, 100), 1],

  [async () => {
    let n = 0, inc = () => n++, loop = Function.every(inc, 100, 2)
    await loop // immediate + 1 run after 100ms
    return await Function.wait(() => n, 400)
  }, 2],

  // [async () => {
  //   await Function.wait(() => null, 250)
  //   let n = 0, inc = () => n++, loop = Function.every(inc, 100)
  //   await Function.wait(loop.stop, 250) // immediate + runs every 100ms + stops after 250ms
  //   return n
  // }, 3],

  [async () => {
    let n = 0, inc = Function.debounce(x => n += x, 100)
    inc(1) // delayed
    return n
  }, 0],

  [async () => {
    let n = 0, inc = Function.debounce(x => n += x, 100)
    inc(1)
    return await Function.wait(() => n, 500)
  }, 1],
  
  [async () => {
    let n = 0, inc = Function.debounce(x => n += x, 100)
    inc(1) // skipped
    inc(2) // skipped
    inc(3)
    return await Function.wait(() => n, 500)
  }, 3],
  
  [async () => {
    let n = 0, inc = Function.throttle(x => n += x, 100)
    inc(1) // immediate
    return n
  }, 1],
  
  [async () => {
    let n = 0, inc = Function.throttle(x => n += x, 100)
    inc(1)
    return await Function.wait(() => n, 500)
  }, 1],
  
  [async () => {
    let n = 0, inc = Function.throttle(x => n += x, 100)
    inc(1)
    inc(2) // skipped
    inc(3)
    return await Function.wait(() => n, 500)
  }, 4],
  
  // [async () => {
  //   let inc = async (n = 0, i, acc) => {
  //     await new Promise(resolve => setTimeout(resolve, 100))
  //     return [n, i, acc]
  //   }
  //   return await Promise.map([1, 2, 3, 4], inc)
  // }, [2, 4]],
]

export default [{ fn: null, tests }]
