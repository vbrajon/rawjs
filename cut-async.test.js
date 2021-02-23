import './raw.js'

export default [
  async () => await Function.wait(() => 1, 100), 1,

  async () => {
    let n = 0, inc = () => n++
    await Function.every(inc, 100, 2) // immediate + 1 run
    return await Function.wait(() => n, 400)
  }, 2,

  async () => {
    let n = 0, inc = () => n++
    await Function.wait(Function.every(inc, 50).stop, 200) // immediate + run every 30ms + stop after 200ms
    return await Function.wait(() => n, 300)
  }, 4,

  async () => {
    let n = 0, inc = Function.debounce(x => n += x, 100)
    inc(1) // delayed
    return n
  }, 0,

  async () => {
    let n = 0, inc = Function.debounce(x => n += x, 100)
    inc(1)
    return await Function.wait(() => n, 500)
  }, 1,
  
  async () => {
    let n = 0, inc = Function.debounce(x => n += x, 100)
    inc(1) // skipped
    inc(2) // skipped
    inc(3)
    return await Function.wait(() => n, 500)
  }, 3,
  
  async () => {
    let n = 0, inc = Function.throttle(x => n += x, 100)
    inc(1) // immediate
    return n
  }, 1,
  
  async () => {
    let n = 0, inc = Function.throttle(x => n += x, 100)
    inc(1)
    return await Function.wait(() => n, 500)
  }, 1,
  
  async () => {
    let n = 0, inc = Function.throttle(x => n += x, 100)
    inc(1)
    inc(2) // skipped
    inc(3)
    return await Function.wait(() => n, 500)
  }, 4,
  
  // async () => {
  //   let inc = async (n = 0, i, acc) => {
  //     await new Promise(resolve => setTimeout(resolve, 100))
  //     return [n, i, acc]
  //   }
  //   return await Promise.map([1, 2, 3, 4], inc)
  // }, [2, 4],
]
