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

Function.wrap = (fn, wrap) => (...args) => wrap(fn, ...args)
Function.partial = (fn, ...outer) => (...inner) => fn(...outer.map((a, i) => (a === null ? inner.shift() : a)).concat(inner))
Function.every = (fn, ms = 0, repeat = Infinity, immediate = true) => {
  fn.start = () => fn.id = fn.id || setInterval(() => {
    if (--repeat < 1 + immediate) fn.stop()
    fn.r ? fn.r(fn()) : fn()
    delete fn.r
  }, ms)
  fn.stop = () => (clearInterval(fn.id), delete fn.id, delete fn.then)
  fn.then = r => fn.r = r
  fn.start()
  if (immediate) fn()
  return fn
}
Function.wait = (fn, ms) => Function.every(fn, ms, 1, false)
Function.debounce = (fn, ms = 0) => (...args) => {
  clearTimeout(fn.id)
  fn.id = setTimeout(() => fn(...args), ms)
}
Function.throttle = (fn, ms = 0) => (...args) => {
  if (fn.flag) return
  fn.flag = true
  setTimeout(() => delete fn.flag, ms)
  fn(...args)
}
Function.memoize = (fn, hash = JSON.stringify) => {
  const f = (...args) => {
    const key = hash(args)
    if (!f.cache.hasOwnProperty(key)) f.cache[key] = fn(...args)
    return f.cache[key]
  }
  f.cache = {}
  return f
}

String.format = (str, ...args) => {
  let n = 0, fn = (m, n) => args[m] || args[n]
  if (typeof args[0] === 'object') fn = (m, n) => args[0][m] || args[0][n]
  if (typeof args[0] === 'function') fn = args.shift()
  return str.replace(/\{[^}]*\}/g, m => fn(m.slice(1, -1), n++) || '')
}
String.lower = str => str.toLowerCase()
String.upper = str => str.toUpperCase()
String.capitalize = str => str.replace(/./, c => c.toUpperCase())
String.words = (str, sep = /[-_,.\s]/) =>
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

Number.duration = num => {
  const n = [31557600000, 2629800000, 604800000, 86400000, 3600000, 60000, 1000]
  const i = n.findIndex(v => v < Math.abs(num)) || 0
  return Math.round(num / n[i]) + ' ' + ['year', 'month', 'week', 'day', 'hour', 'minute', 'second', 'millisecond'][i] + (Math.abs(num) / n[i] > 1.5 ? 's' : '')
}
Number.format = (num, fmt) => {
  if (typeof fmt === 'string') return new Intl.NumberFormat(fmt).format(num)
  if (typeof fmt === 'number') return (+num.toPrecision(fmt)).toExponential().replace(/([+-\d.]+)e([+-\d]+)/, (m, n, e) => +(n + 'e' + (e - Math.floor(e / 3) * 3)) + (['mµnpfazy', 'kMGTPEZY'][+(e > 0)].split('')[Math.abs(Math.floor(e / 3)) - 1] || ''))
  return +num.toPrecision(16)
}
Object.getOwnPropertyNames(Math)
  .filter(k => typeof Math[k] === 'function')
  .forEach(k => (Number[k] = Math[k]))

Date.relative = (date, d2 = new Date()) => (date - d2).duration().replace(/^(-?)(.*)/, (m, sign, d) => d + (sign === '-' ? ' ago' : ' from now'))
Date.getWeek = (date, soy = new Date(date.getFullYear(), 0, 0)) => Math.floor(((date - soy) / 86400000 + 6 - soy.getDay()) / 7)
Date.getQuarter = date => Math.ceil((date.getMonth() + 1) / 3)
Date.format = (date, fmt = 'YYYY-MM-DD', lang = 'en') => {
  const intl = option => date.toLocaleString(lang, option)
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
  const letters = { s: 'Seconds', m: 'Minutes', h: 'Hours', D: 'Date', W: 'Week', M: 'Month', Q: 'Quarter', Y: 'FullYear' }
  Object.keys(letters).map(letter => {
    const zeros = letter === 'Y' ? '0000' : '00'
    fmt = fmt.replace(RegExp(letter + '+', 'g'), m => {
      let int
      if (letter === 'W') int = 'W' + Date.getWeek(date)
      if (letter === 'M') int = date.getMonth() + 1
      if (letter === 'Q') int = 'Q' + Date.getQuarter(date)
      if (!int) int = date['get' + letters[letter]]()
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
    const last = { Seconds: 59, Minutes: 59, Hours: 23, Date: new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(), Month: 11 }
    fn = i => names.slice(0, i).map(name => d['set' + name](last[name]))
  }
  str
    .replace(/(\d*)\s*seconds?/, (m, n) => fn(0, +n || 1 - (n === '0')))
    .replace(/(\d*)\s*minutes?/, (m, n) => fn(1, +n || 1 - (n === '0')))
    .replace(/(\d*)\s*hours?/, (m, n) => fn(2, +n || 1 - (n === '0')))
    .replace(/(\d*)\s*days?/, (m, n) => fn(3, +n || 1 - (n === '0')))
    .replace(/(\d*)\s*months?/, (m, n) => fn(4, +n || 1 - (n === '0')))
    .replace(/(\d*)\s*years?/, (m, n) => fn(5, +n || 1 - (n === '0')))
  d.setMilliseconds(0)
  if (['-', '+'].includes(sign) && /(year|month)/.test(str) && !/day/.test(str) && date.getDate() !== d.getDate()) return d.start('month').minus('second')
  return d
}
Date.plus = (date, str) => date.modify(str, '+')
Date.minus = (date, str) => date.modify(str, '-')
Date.start = (date, str) => date.modify(str, '<')
Date.end = (date, str) => date.modify(str, '>')

RegExp.escape = r => RegExp(r.source.replace(/([\\/'*+?|()[\]{}.^$-])/g, '\\$1'), r.flags)
RegExp.plus = (r, f) => RegExp(r.source, r.flags.replace(f, '') + f)
RegExp.minus = (r, f) => RegExp(r.source, r.flags.replace(f, ''))

function eq(a, b) {
  if (a == null || b == null) return a === b
  if (a.__proto__ !== b.__proto__) return false
  if (![Object.prototype.toString, Array.prototype.toString].includes(a.toString)) return a === b || a.toString() === b.toString()
  if (Object.getOwnPropertyNames(a).length !== Object.getOwnPropertyNames(b).length) return false
  return Object.keys(a).every(k => a[k] === a || eq(a[k], b[k]))
}
function access(x, path) {
  try {
    if (!path) return x
    if (x[path]) return typeof x[path] === 'function' ? x[path]() : x[path]
    return path
      .replace(/\[[^\]]\]/g, m => '.' + m.replace(/^[['"]+/, '').replace(/['"]]+$/, ''))
      .split('.')
      .reduce((x, p) => typeof x[p] === 'function' ? x[p]() : x[p], x)
  } catch (e) {}
}
function default_sort(a, b) {
  if (typeof a !== typeof b) return typeof a > typeof b ? -1 : 1
  if (!a && a !== 0) return -1
  if (!b && b !== 0) return 1
  return a === b ? 0 : a > b ? 1 : -1
}
function directed_sort(p, desc = /^-/.test(p)) {
  p = ('' + p).replace(/^[+-]/, '')
  return (a, b) => default_sort(access(a, p), access(b, p)) * (!desc || -1)
}
function multi_sort(p) {
  return (a, b) => {
    for (const k of p) {
      const z = directed_sort(k)(a, b)
      if (z) return z
    }
  }
}

if (typeof window === 'undefined') window = global
window.raw = (primitive, fname) => {
  if (primitive && fname) {
    if (primitive.prototype[fname] && primitive.prototype[fname].toString().includes('[native code]')) {
      primitive.prototype['_' + fname] = primitive.prototype[fname]
      primitive[fname] = (x, ...args) => x['_' + fname](...args)
      if (['sort', 'reverse'].includes(fname)) primitive[fname] = (x, ...args) => x.slice()['_' + fname](...args)
    }
    if (typeof primitive[fname] !== 'function') return
    const fn = primitive[fname].fn || primitive[fname]
    const native = primitive.prototype['_' + fname]
    const shortcut = raw.shortcut.find(s => s.on.includes(fname))
    primitive[fname] = (x, ...args) => primitive[fname].fn(x, primitive[fname].shortcut(args[0]), ...args.slice(1))
    primitive[fname].fn = fn
    primitive[fname].native = native
    primitive[fname].shortcut = shortcut ? shortcut.fn : x => x
    if (raw.extend) Object.defineProperty(primitive.prototype, fname, {
      enumerable: false,
      configurable: true,
      writable: true,
      value: function(...args) { return primitive[fname](this, ...args) },
    })
    return primitive.name + '.' + fname + (native ? '#native' : '') + (shortcut ? '#shortcut' : '')
  }
  if (primitive) return Object.keys(primitive).concat(raw[primitive.name] || []).map(fname => raw(primitive, fname))
  return [Object, Array, Function, String, Number, Date, RegExp].map(primitive => raw(primitive)).flat()
}
raw.version = '1.1.1'
raw.Object = ['keys', 'values']
raw.Array = ['map', 'reduce', 'filter', 'find', 'findIndex', 'sort', 'reverse']
raw.shortcut = [
  {
    on: ['map'],
    fn: a => {
      if (a == null) return x => x
      if (a instanceof Function) return a
      return x => access(x, a)
    },
  },
  {
    on: ['filter', 'find', 'findIndex'],
    fn: a => {
      if (a == null) return x => x
      if (a instanceof Function) return a
      if (a.__proto__ === Object.prototype) return x => Object.entries(a).every(([k, v]) => (v.test && v.test(x[k])) || (v.some && v.some(d => eq(x[k], d))) || eq(x[k], v))
      return x => (a.test && a.test(x)) || (a.some && a.some(d => eq(x, d))) || eq(x, a)
    },
  },
  {
    on: ['sort'],
    fn: a => {
      if (a == null) return default_sort
      if (a instanceof Array) return multi_sort(a)
      if (a instanceof Function && a.length === 1) return (x, y) => default_sort(a(x), a(y))
      if (a instanceof Function && a.length === 2) return a
      return directed_sort(a)
    },
  },
]
raw()
raw.extend = true
