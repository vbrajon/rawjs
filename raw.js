const raw = () => {
  for (const primitive of [Object, Array, Function, String, Number, Boolean, Date, RegExp]) {
    for (const fname in primitive) {
      Object.defineProperty(primitive.prototype, fname, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function() {
          return primitive[fname](this, ...raw.wrap(arguments, primitive, fname, this))
        },
      })
    }
  }
}
raw.version = '1.1.1'
raw.wrap = (args, primitive, fname, ctx) => {
  if (args.length === 0) {
    if (['map', 'filter', 'find'].includes(fname)) return [x => x]
    return []
  }

  let a0 = args[0]
  if (['map', 'filter'].includes(fname) && typeof a0 === 'number') return [x => x[a0]]
  if (['map', 'filter'].includes(fname) && typeof a0 === 'string') return [x => access(x, a0)]
  if (fname === 'find' && typeof a0 !== 'function') return [x => same(x, a0)]
  if (fname === 'sort' && typeof a0 !== 'function') return [multi_sort(a0)]
  if (fname === 'sort' && typeof a0 === 'function' && a0.length === 1) return [(a, b) => (a0(a) === a0(b) ? 0 : a0(a) > a0(b) ? 1 : -1)]
  return args

  function access(x, path) {
    return path
      .replace(/\[[^\]]\]/g, m => '.' + m.slice(1, -1))
      .split('.')
      .reduce((x, p) => {
        try {
          return typeof x[p] === 'function' ? x[p]() : x[p]
        } catch (e) {
          return null
        }
      }, x)
  }
  function same(a, b) {
    if (a === b) return true
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime()
    if (!a || !b || (typeof a != 'object' && typeof b !== 'object')) return a === b
    if (a === null || a === undefined || b === null || b === undefined) return false
    if (a.prototype !== b.prototype) return false
    let keys = Object.keys(a)
    if (keys.length !== Object.keys(b).length) return false
    return keys.every(k => same(a[k], b[k]))
  }
  function directed_sort(p) {
    if (!/^-/.test(p)) return (a, b) => (a[p] === b[p] ? 0 : a[p] > b[p] ? 1 : -1)
    p = p.slice(1)
    return (a, b) => (a[p] === b[p] ? 0 : a[p] > b[p] ? -1 : 1)
  }
  function multi_sort(p) {
    if (!Array.isArray(p)) return directed_sort(p)
    return (a, b) => {
      for (const k of p) {
        const z = directed_sort(k)(a, b)
        if (z) return z
      }
    }
  }
}

Object.map = (obj, fn) =>
  Object.keys(obj).reduce((acc, k, i) => {
    acc[k] = fn(obj[k], k, i, obj)
    return acc
  }, {})
Object.reduce = (obj, fn, base) => Object.keys(obj).reduce((acc, k, i) => fn(acc, obj[k], k, i, obj), base)
Object.filter = (obj, fn) =>
  Object.keys(obj)
    .filter((k, i) => fn(obj[k], k, i, obj))
    .reduce((acc, k) => {
      acc[k] = obj[k]
      return acc
    }, {})
Object.find = (obj, fn) => Object.keys(obj).find((k, i) => fn(obj[k], k, i, obj))

Array.prototype._map = [].map
Array.prototype._reduce = [].reduce
Array.prototype._filter = [].filter
Array.prototype._find = [].find
Array.prototype._sort = [].sort
Array.map = (arr, fn) => arr._map(fn)
Array.reduce = (arr, fn, base) => arr._reduce(fn, base)
Array.filter = (arr, fn) => arr._filter(fn)
Array.find = (arr, fn) => arr._find(fn)
Array.sort = (arr, fn) => arr.slice()._sort(fn)
Array.group = (arr, fn) =>
  arr.map(fn).reduce((acc, v, i) => {
    acc[v] = acc[v] || []
    acc[v].push(arr[i])
    return acc
  }, {})
Array.unique = arr => [...new Set(arr)]
Array.min = arr => arr.slice().sort((a, b) => a - b)[0]
Array.max = arr => arr.slice().sort((a, b) => b - a)[0]
Array.sum = arr => arr.reduce((acc, v) => acc + v, 0)
Array.median = arr => {
  const mid = Math.floor(arr.length / 2)
  const nums = [...arr].sort((a, b) => a - b)
  return arr.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2
}
Array.average = arr => arr.reduce((acc, v) => acc + v, 0) / arr.length

Function.delay = (fn, ms = 0) => {
  fn.timeout = setTimeout(fn, ms)
  return fn
}
Function.every = (fn, ms = 0, immediate = true) => {
  if (immediate) fn()
  fn.timeout = setInterval(fn, ms)
  return fn
}
Function.cancel = (fn, ms = 0) => {
  fn.timeout = clearTimeout(fn.timeout)
  return fn
}
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
Function.memoize = fn => {
  fn.cache = {}
  return function() {
    const hash = JSON.stringify(arguments)
    if (!fn.cache[hash]) fn.cache[hash] = fn(arguments) || 'null-memoize'
    return fn.cache[hash] === 'null-memoize' ? null : fn.cache[hash]
  }
}
Function.partial = (fn, ...outer) => (...inner) => fn(...outer.map((a, i) => (a === null ? inner.shift() : a)).concat(inner))

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
String.words = (str, clean = /[^a-z0-9-_\s]+/gi, normalize = true) =>
  str
    .normalize(normalize ? 'NFKD' : false)
    .replace(clean, '')
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .split(/[-_\s]/)
    .filter(Boolean)
String.join = (str, sep = ' ') => {
  let words = str.words()
  if (sep === 'title') return words.map('lower.capitalize').join(' ')
  if (sep === 'pascal') return words.map('lower.capitalize').join('')
  if (sep === 'camel') return str.join('pascal').replace(/./, c => c.toLowerCase())
  if (['dash', 'list', 'kebab'].includes(sep)) sep = '-'
  if (['underscore', 'snake'].includes(sep)) sep = '_'
  if (['-', '_'].includes(sep)) words = words.map('lower')
  return words.join(sep)
}

Object.getOwnPropertyNames(Math)
  .filter(k => typeof Math[k] === 'function')
  .forEach(k => (Number[k] = Math[k]))
Number.format = (num, sep1 = ',', sep2 = '.') => {
  const [int, dec] = ('' + num).split('.')
  return [int.slice(0, int.length % 3)].concat(int.slice(int.length % 3).match(/.../g)).join(sep1) + (dec ? sep2 + dec : '')
}

Date.format = (date, fmt = 'YYYY-MM-DD', lang = 'en') => {
  const intl = option => date.toLocaleDateString(lang, option)
  if (/,[^ ]/.test(fmt)) {
    const parts = fmt.split(',')
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
    return intl(options)
  }
  const pad = (int, length) =>
    length === 1
      ? int
      : Array(length)
          .fill(0)
          .concat(int)
          .join('')
          .slice(-length)
  return fmt
    .replace(/s+/g, m => pad(date.getSeconds(), m.length))
    .replace(/m+/g, m => pad(date.getMonth(), m.length))
    .replace(/h+/g, m => pad(date.getHours(), m.length))
    .replace(/D+/g, m => pad(date.getDate(), m.length))
    .replace(/M+/g, m => pad(date.getMonth() + 1, m.length))
    .replace(/Y+/g, m => pad(date.getFullYear(), m.length))
}
Date.modify = (date, str, sign) => {
  const d = new Date(date)
  const names = ['Seconds', 'Minutes', 'Hours', 'Date', 'Month', 'FullYear']
  let fn
  if (sign === '+') fn = (n, i) => d['set' + names[i]](d['get' + names[i]]() + n)
  if (sign === '-') fn = (n, i) => d['set' + names[i]](d['get' + names[i]]() - n)
  if (sign === '<') fn = (n, i) => names.slice(0, i).map(name => d['set' + name](name === 'Date' ? 1 : 0))
  if (sign === '>') {
    const last = { Seconds: 59, Minutes: 59, Hours: 23, Date: new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(), Month: 12 }
    fn = (n, i) => names.slice(0, i).map(name => d['set' + name](last[name]))
  }
  str.split(',').forEach(part =>
    part
      .trim()
      .replace(/^(\d*)\s*seconds?$/, (m, n) => fn(+n || 1, 0))
      .replace(/^(\d*)\s*minutes?$/, (m, n) => fn(+n || 1, 1))
      .replace(/^(\d*)\s*hours?$/, (m, n) => fn(+n || 1, 2))
      .replace(/^(\d*)\s*days?$/, (m, n) => fn(+n || 1, 3))
      .replace(/^(\d*)\s*months?$/, (m, n) => fn(+n || 1, 4))
      .replace(/^(\d*)\s*years?$/, (m, n) => fn(+n || 1, 5)),
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

export default raw
