if (typeof window === 'undefined') window = global
window.raw = (primitive, fname) => {
  if (primitive && fname) {
    let f = (ctx, ...args) => primitive[fname](...raw.wrap(ctx, args, primitive, fname))
    if (primitive.prototype[fname]) {
      if (!primitive.prototype[fname].toString().includes('{ [native code] }')) return
      if (raw[primitive.name + '#' + fname]) return
      raw[primitive.name + '#' + fname] = primitive.prototype[fname]
      f = (ctx, ...args) => raw[primitive.name + '#' + fname].call(...raw.wrap(ctx, args, primitive, fname))
    }
    Object.defineProperty(primitive.prototype, fname, {
      enumerable: false,
      configurable: true,
      writable: true,
      value: function __raw__() {
        return f(this, ...arguments)
      },
    })
    return
  }
  for (const primitive of [Object, Array, Function, String, Number, Boolean, Date, RegExp]) {
    for (const fname in primitive) {
      raw(primitive, fname)
    }
    for (const fname of raw[primitive.name] || []) {
      raw(primitive, fname)
    }
  }
}
raw.version = '1.1.1'
Array.fromEntries = Object.fromEntries
raw.Object = ['keys', 'values', 'entries']
raw.Array = ['map', 'reduce', 'filter', 'find', 'findIndex', 'sort', 'reverse', 'fromEntries']
raw.wrap = (ctx, args, primitive, fname) => {
  if (primitive === Array && ['sort', 'reverse'].includes(fname)) ctx = ctx.slice()
  if (args.length === 0) {
    if (['map', 'filter', 'find', 'findIndex', 'group'].includes(fname)) return [ctx, x => x]
    if (['sort'].includes(fname)) return [ctx, sort]
    return [ctx]
  }

  let a0 = args[0]
  const t0 = Object.prototype.toString.call(a0).slice(8, -1)
  if (['map', 'group'].includes(fname) && ['String', 'Number'].includes(t0)) return [ctx, x => access(x, a0)]
  if (['filter', 'find', 'findIndex'].includes(fname) && t0 === 'Object') return [ctx, x => Object.entries(a0).every(([k, v]) => (v.test && v.test(x[k])) || (v.some && v.some(d => eq(x[k], d))) || eq(x[k], v))]
  if (['filter', 'find', 'findIndex'].includes(fname) && t0 !== 'Function') return [ctx, x => (a0.test && a0.test(x)) || (a0.some && a0.some(d => eq(x, d))) || eq(x, a0)]
  if (fname === 'sort' && t0 === 'Array') return [ctx, multi_sort(a0)]
  if (fname === 'sort' && t0 !== 'Function') return [ctx, directed_sort(a0, args[1])]
  if (fname === 'sort' && t0 === 'Function' && a0.length === 1) return [ctx, (a, b) => (a0(a) === a0(b) ? 0 : a0(a) > a0(b) ? 1 : -1)]
  return [ctx, ...args]

  function access(x, path) {
    if (!path) return x
    if (typeof path === 'number') return x[path]
    return path
      .replace(/\[[^\]]\]/g, m => '.' + m.replace(/^[['"]+/, '').replace(/['"]]+$/, ''))
      .split('.')
      .reduce((x, p) => {
        try {
          return typeof x[p] === 'function' ? x[p]() : x[p]
        } catch (e) {}
      }, x)
  }
  function eq(a, b) {
    if (a === b) return true
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime()
    if (!a || !b || (typeof a != 'object' && typeof b !== 'object')) return a === b
    if (a === null || a === undefined || b === null || b === undefined) return false
    if (a.prototype !== b.prototype) return false
    let keys = Object.keys(a)
    if (keys.length !== Object.keys(b).length) return false
    return keys.every(k => eq(a[k], b[k]))
  }
  function sort(a, b) {
    if (typeof a !== typeof b) return typeof a > typeof b ? -1 : 1
    if (!a && a !== 0) return -1
    if (!b && b !== 0) return 1
    return a === b ? 0 : a > b ? 1 : -1
  }
  function directed_sort(p, inv = /^-/.test(p)) {
    p = ('' + p).replace(/^[+-]/, '')
    return (a, b) => sort(access(a, p), access(b, p)) * (inv || -1)
  }
  function multi_sort(p) {
    return (a, b) => {
      for (const k of p) {
        const z = directed_sort(k)(a, b)
        if (z) return z
      }
    }
  }
}

Object.map = (obj, fn) => Object.keys(obj).reduce((acc, k, i) => ((acc[k] = fn(obj[k], k, i, obj)), acc), {})
Object.reduce = (obj, fn, base) => Object.keys(obj).reduce((acc, k, i) => fn(acc, obj[k], k, i, obj), base)
Object.filter = (obj, fn) =>
  Object.keys(obj)
    .filter((k, i) => fn(obj[k], k, i, obj))
    .reduce((acc, k) => ((acc[k] = obj[k]), acc), {})
Object.find = (obj, fn) => Object.keys(obj).find((k, i) => fn(obj[k], k, i, obj))

Array.group = (arr, fn) => arr.map(fn).reduce((acc, v, i) => ((acc[v] = (acc[v] || []).concat([arr[i]])), acc), {})
Array.unique = arr => Array.from(new Set(arr))
Array.min = arr => arr.slice().sort((a, b) => a - b)[0]
Array.max = arr => arr.slice().sort((a, b) => b - a)[0]
Array.sum = arr => arr.reduce((acc, v) => acc + v, 0)
Array.mean = arr => arr.reduce((acc, v) => acc + v, 0) / arr.length
Array.median = arr => {
  const mid = Math.floor(arr.length / 2)
  const nums = [...arr].sort((a, b) => a - b)
  return arr.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2
}
Array.shuffle = (arr, r) => arr.map((v, i) => ((r = Math.floor(Math.random() * i)), ([arr[i], arr[r]] = [arr[r], arr[i]])))

// Function.wrap = (fn, pre = (...args) => args, post = x => x) => (...args) => post(fn(...pre(...args)))
Function.partial = (fn, ...outer) => (...inner) => fn(...outer.map((a, i) => (a === null ? inner.shift() : a)).concat(inner))
Function.wait = (fn, ms = 0, repeat = 1, immediate = true) => {
  const f = (...args) => f.promise = new Promise((ok, ko) => {
    f.timeout = setInterval(async () => {
      try {
        ok(await fn(...args))
      } catch (e) {
        ko(e)
      } finally {
        if (--repeat === 0) f.cancel()
      }
    }, ms)
  })
  f.cancel = () => (clearTimeout(f.timeout), delete f.timeout, delete f.promise, delete f.cancel)
  if (immediate) f()
  return f
}
Function.every = (fn, ms, repeat = 0, immediate = true) => Function.wait(fn, ms, repeat, immediate)
Function.debounce = (fn, ms = 0) => (...args) => {
  clearTimeout(fn.timeout)
  fn.timeout = setTimeout(() => fn(...args), ms)
}
Function.throttle = (fn, ms = 0) => (...args) => {
  if (fn.flag) return
  fn.flag = true
  setTimeout(() => delete fn.flag, ms)
  fn(...args)
}
Function.memoize = (fn, hash_fn = JSON.stringify) => {
  const f = (...args) => {
    const hash = hash_fn(args)
    if (!f.cache.hasOwnProperty(hash)) f.cache[hash] = fn(...args)
    return f.cache[hash]
  }
  f.cache = {}
  return f
}

String.format = (str, ...args) => {
  args.map((arg, i) => {
    if (typeof arg === 'object')
      return arg.map((v, k) => {
        const name_re = /^\/.*\/$/.test(k) ? RegExp(k.slice(1, -1), 'g') : RegExp('\\{' + k + '\\}', 'g')
        str = str.replace(name_re, v)
      })
    const null_re = /\{\}/
    const position_re = RegExp('\\{' + i + '\\}', 'g')
    str = str.replace(null_re, arg)
    str = str.replace(position_re, arg)
  })
  return str
}
String.lower = str => str.toLowerCase()
String.upper = str => str.toUpperCase()
String.capitalize = str => str.replace(/./, c => c.toUpperCase())
String.words = (str, sep = /[-_.\s]/) =>
  str
    .normalize('NFKD')
    .replace(RegExp('[^A-z0-9' + sep.source.slice(1, -1) + ']', 'g'), '')
    .replace(/([a-z])([A-Z\d])/g, '$1 $2')
    .split(sep)
    .filter(Boolean)
String.join = (str, sep = ' ') => {
  let words = str.words()
  if (sep === 'title') return words.map('lower.capitalize').join(' ')
  if (sep === 'pascal') return words.map('lower.capitalize').join('')
  if (sep === 'camel') return str.join('pascal').replace(/./, c => c.toLowerCase())
  if (['dash', 'list', 'kebab', 'underscore', 'snake'].includes(sep)) words = words.map('lower')
  if (['dash', 'list', 'kebab'].includes(sep)) sep = '-'
  if (['underscore', 'snake'].includes(sep)) sep = '_'
  return words.join(sep)
}

Number.format = (num, fmt) => fmt ? new Intl.NumberFormat(fmt).format(num) : +num.toPrecision(16)
Object.getOwnPropertyNames(Math)
  .filter(k => typeof Math[k] === 'function')
  .forEach(k => (Number[k] = Math[k]))

Date.format = (date, fmt = 'YYYY-MM-DD', lang = 'en') => {
  const intl = option => date.toLocaleDateString(lang, option)
  const parts = fmt.split(',').map(s => s.trim())
  if (!parts.filter(d => !['year', 'month', 'mon', 'day', 'weekday', 'wday', 'hour', 'minute', 'second'].includes(d)).length) {
    const options = {}
    if (parts.includes('second')) options.second = '2-digit'
    if (parts.includes('minute')) options.minute = '2-digit'
    if (parts.includes('hour')) options.hour = '2-digit'
    if (parts.includes('wday')) options.weekday = 'short'
    if (parts.includes('weekday')) options.weekday = 'long'
    if (parts.includes('day')) options.day = 'numeric'
    if (parts.includes('mon')) options.month = 'short'
    if (parts.includes('month')) options.month = 'long'
    if (parts.includes('year')) options.year = 'numeric'
    if (!options.day && !options.month && !options.year) return Date.format(date, [options.hour && 'hh', options.minute && 'mm', options.second && 'ss'].filter(d => d).join(':'))
    return intl(options)
  }
  const letters = { s: 'Seconds', m: 'Minutes', h: 'Hours', D: 'Date', M: 'Month', Y: 'FullYear' }
  Object.keys(letters).map(letter => {
    const zeros = letter === 'Y' ? '0000' : '00'
    let int = date['get' + letters[letter]]()
    if (letter === 'M') int = int + 1
    fmt = fmt.replace(RegExp(letter + '+', 'g'), m => {
      if (m.length === 1) return int
      if (m.length > zeros.length) return (zeros + int).slice(-zeros.length) + letter
      return (zeros + int).slice(-m.length)
    })
  })
  return fmt
}
Date.modify = (date, str, sign) => {
  const d = new Date(date)
  const names = ['Seconds', 'Minutes', 'Hours', 'Date', 'Month', 'FullYear']
  let fn
  if (sign === '+') fn = (i, n) => d['set' + names[i]](d['get' + names[i]]() + n)
  if (sign === '-') fn = (i, n) => d['set' + names[i]](d['get' + names[i]]() - n)
  if (sign === '<') fn = (i, n) => names.slice(0, i).map(name => d['set' + name](name === 'Date' ? 1 : 0))
  if (sign === '>') {
    const last = { Seconds: 59, Minutes: 59, Hours: 23, Date: new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(), Month: 12 }
    fn = i => names.slice(0, i).map(name => d['set' + name](last[name]))
  }
  str.split(',').forEach(part =>
    part
      .trim()
      .replace(/^(\d*)\s*seconds?$/, (m, n) => fn(0, +n || 1 - (n === '0')))
      .replace(/^(\d*)\s*minutes?$/, (m, n) => fn(1, +n || 1 - (n === '0')))
      .replace(/^(\d*)\s*hours?$/, (m, n) => fn(2, +n || 1 - (n === '0')))
      .replace(/^(\d*)\s*days?$/, (m, n) => fn(3, +n || 1 - (n === '0')))
      .replace(/^(\d*)\s*months?$/, (m, n) => fn(4, +n || 1 - (n === '0')))
      .replace(/^(\d*)\s*years?$/, (m, n) => fn(5, +n || 1 - (n === '0'))),
  )
  d.setMilliseconds(0)
  return d
}
Date.plus = (date, str) => date.modify(str, '+')
Date.minus = (date, str) => date.modify(str, '-')
Date.start = (date, str) => date.modify(str, '<')
Date.end = (date, str) => date.modify(str, '>')

RegExp.escape = r => RegExp(r.source.replace(/([\\/'*+?|()[\]{}.^$-])/g, '\\$1'), r.flags)
RegExp.plus = (r, f) => RegExp(r.source, r.flags.replace(f, '') + f)
RegExp.minus = (r, f) => RegExp(r.source, r.flags.replace(f, ''))
