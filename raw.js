Object.map = (obj, fn) => Object.keys(obj).reduce((acc, k, i) => ((acc[k] = fn(obj[k], k, i, obj)), acc), {})
Object.reduce = (obj, fn, base) => Object.keys(obj).reduce((acc, k, i) => fn(acc, obj[k], k, i, obj), base)
Object.filter = (obj, fn) =>
  Object.keys(obj)
    .filter((k, i) => fn(obj[k], k, i, obj))
    .reduce((acc, k) => ((acc[k] = obj[k]), acc), {})
Object.find = (obj, fn) => Object.keys(obj).find((k, i) => fn(obj[k], k, i, obj))
Object.eq = (a, b) => {
  if (a == null || b == null) return a === b
  if (a.__proto__ !== b.__proto__) return false
  if (![Object.prototype.toString, Array.prototype.toString].includes(a.toString)) return a === b || a.toString() === b.toString()
  if (Object.keys(a).length !== Object.keys(b).length) return false
  return Object.keys(a).every(k => a[k] === a || Object.eq(a[k], b[k]))
}
Object.access = (x, path) => {
  try {
    if (path instanceof Object) return path.map(p => Object.access(x, p))
    if (!path) return x
    if (x[path]) return typeof x[path] === 'function' ? x[path]() : x[path]
    return path
      .replace(/\[[^\]]*\]/g, m => '.' + m.replace(/^[['"\s]+/, '').replace(/['"\s]]+$/, ''))
      .split('.')
      .reduce((x, path) => typeof x[path] === 'function' ? x[path]() : x[path], x)
  } catch (e) {}
}

Array.group = (arr, fn) => arr.map(fn).reduce((acc, v, i) => ((acc[v] = (acc[v] || []).concat([arr[i]])), acc), {})
Array.unique = arr => Array.from(new Set(arr))
Array.min = arr => arr.slice().sort((a, b) => a - b)[0]
Array.max = arr => arr.slice().sort((a, b) => b - a)[0]
Array.sum = arr => arr.reduce((acc, v) => acc + v, 0)
Array.mean = arr => arr.reduce((acc, v) => acc + v, 0) / arr.length
Array.median = arr => {
  const mid = Math.floor(arr.length / 2)
  const nums = arr.slice().sort((a, b) => a - b)
  return arr.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2
}

Function.wrap = (fn, wrap) => Object.assign((...args) => wrap(fn, ...args), { fn, wrap })
Function.partial = (fn, ...outer) => (...inner) => fn(...outer.map((a, i) => (a === null ? inner.shift() : a)).concat(inner))
Function.every = (fn, ms = 0, repeat = Infinity, immediate = true) => {
  fn.start = () => {
    if (fn.id) return
    fn.id = setInterval(() => {
      if (--repeat < 1 + immediate) fn.stop()
      fn.r ? fn.r(fn()) : fn()
      delete fn.r
    }, ms)
  }
  fn.stop = () => (clearInterval(fn.id), delete fn.id, delete fn.then)
  fn.then = r => (fn.r = r)
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
  let i = 0,
    fn = m => args[m]
  if (typeof args[0] === 'object') fn = m => args[0][m]
  if (typeof args[0] === 'function') fn = args.shift()
  return str.replace(/\{[^}]*\}/g, m => fn(m.length === 2 ? i : m.slice(1, -1), i++) || '')
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
  const n = [31557600000, 2629800000, 604800000, 86400000, 3600000, 60000, 1000, 1]
  const i = n.findIndex(v => v <= Math.abs(num))
  return Math.round(num / n[i]) + ' ' + ['year', 'month', 'week', 'day', 'hour', 'minute', 'second', 'millisecond'][i] + (Math.abs(num) / n[i] > 1.5 ? 's' : '')
}
Number.format = (num, fmt) => {
  if (typeof fmt === 'string') return new Intl.NumberFormat(fmt).format(num)
  if (typeof fmt === 'number') return (+num.toPrecision(fmt)).toExponential().replace(/([+-\d.]+)e([+-\d]+)/, (m, n, e) => +(n + 'e' + (e - Math.floor(e / 3) * 3)) + (['mµnpfazy', 'kMGTPEZY'][+(e > 0)].split('')[Math.abs(Math.floor(e / 3)) - 1] || ''))
  return +num.toPrecision(15)
}

Date.relative = (date, d2 = new Date()) => (date - d2).duration().replace(/^(-?)(.*)/, (m, sign, d) => d + (sign === '-' ? ' ago' : ' from now'))
Date.getWeek = (date, soy = new Date(date.getFullYear(), 0, 0)) => Math.floor(((date - soy) / 86400000 + 6 - soy.getDay()) / 7)
Date.getQuarter = date => Math.ceil((date.getMonth() + 1) / 3)
Date.getLastDate = date => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
Date.format = (date, fmt = 'YYYY-MM-DD', lang = 'en') => {
  const intl = options => date.toLocaleString(lang, options)
  const parts = fmt.split(',').map(s => s.trim())
  if (!parts.filter(v => !['year', 'month', 'mon', 'day', 'weekday', 'wday', 'hour', 'minute', 'second'].includes(v)).length) {
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
    if (!options.day && !options.month && !options.year) return Date.format(date, [options.hour && 'hh', options.minute && 'mm', options.second && 'ss'].filter(v => v).join(':'))
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
  let d = new Date(date)
  const names = ['Seconds', 'Minutes', 'Hours', 'Date', 'Month', 'FullYear']
  const durations = [1000, 60000, 3600000, 86400000]
  let fn
  if (sign === '+') fn = (i, n) => (durations[i] ? (d = new Date(+d + durations[i] * n)) : d['set' + names[i]](d['get' + names[i]]() + n))
  if (sign === '-') fn = (i, n) => (durations[i] ? (d = new Date(+d - durations[i] * n)) : d['set' + names[i]](d['get' + names[i]]() - n))
  if (sign === '<') fn = (i, n) => names.slice(0, i).map(name => d['set' + name](name === 'Date' ? 1 : 0))
  if (sign === '>') {
    const last = { Seconds: 59, Minutes: 59, Hours: 23, Date: Date.getLastDate, Month: 11 }
    fn = i =>
      names
        .slice(0, i)
        .reverse()
        .map(name => d['set' + name](typeof last[name] === 'number' ? last[name] : last[name](d)))
  }
  str
    .replace(/([+-\.\d]*)\s*seconds?/i, (m, n) => fn(0, +n || 1 - (n === '0')))
    .replace(/([+-\.\d]*)\s*minutes?/i, (m, n) => fn(1, +n || 1 - (n === '0')))
    .replace(/([+-\.\d]*)\s*hours?/i, (m, n) => fn(2, +n || 1 - (n === '0')))
    .replace(/([+-\.\d]*)\s*days?/i, (m, n) => fn(3, +n || 1 - (n === '0')))
    .replace(/([+-\.\d]*)\s*months?/i, (m, n) => fn(4, +n || 1 - (n === '0')))
    .replace(/([+-\.\d]*)\s*years?/i, (m, n) => fn(5, +n || 1 - (n === '0')))
  d.setMilliseconds(0)
  if (['-', '+'].includes(sign) && /(year|month)/i.test(str) && !/day/i.test(str) && date.getDate() !== d.getDate()) return d.start('month').minus('second')
  return d
}
Date.plus = (date, str) => date.modify(str, '+')
Date.minus = (date, str) => date.modify(str, '-')
Date.start = (date, str) => date.modify(str, '<')
Date.end = (date, str) => date.modify(str, '>')

RegExp.escape = r => RegExp(r.source.replace(/([\\/'*+?|()[\]{}.^$-])/g, '\\$1'), r.flags)
RegExp.plus = (r, f) => RegExp(r.source, r.flags.replace(f, '') + f)
RegExp.minus = (r, f) => RegExp(r.source, r.flags.replace(f, ''))

// RAW Core functions
Object.extend = (primitive, fname) => {
  if (primitive === true) return (Object.extend.all = true), Object.extend()
  if (primitive === false) return (Object.extend.all = false), Object.extend()
  if (primitive === undefined) return [Object, Array, Function, String, Number, Date, RegExp].map(primitive => Object.extend(primitive)).flat()
  if (!fname) return Array.unique(Object.keys(primitive).concat(Object.extend[primitive.name] || [])).map(fname => Object.extend(primitive, fname))
  if (fname === 'extend') return 'Object.extend#core'
  // Wrap function with shortcuts and extend prototype
  if (primitive.prototype[fname] && primitive.prototype[fname].toString().includes('[native code]')) {
    primitive.prototype['_' + fname] = primitive.prototype[fname]
    primitive[fname] = (x, ...args) => primitive.prototype['_' + fname].call(x, ...args)
    if (['sort', 'reverse'].includes(fname)) primitive[fname] = (x, ...args) => primitive.prototype['_' + fname].call(x.slice(), ...args)
  }
  if (typeof primitive[fname] !== 'function') return
  const fn = primitive[fname].fn || primitive[fname]
  const native = primitive.prototype['_' + fname]
  const shortcut = Object.keys(Object.extend).includes(fname)
  primitive[fname] = shortcut ? Function.wrap(fn, Object.extend[fname]) : fn
  if (Object.extend.all)
    Object.defineProperty(primitive.prototype, fname, {
      enumerable: false,
      configurable: true,
      writable: true,
      value: function(...args) {
        return primitive[fname](this, ...args)
      },
    })
  return primitive.name + '.' + fname + (native ? '#native' : '') + (shortcut ? '#shortcut' : '')
}
Object.extend.version = '1.1.1'
Object.extend.Object = ['keys', 'values']
Object.extend.Array = ['map', 'reduce', 'filter', 'find', 'findIndex', 'sort', 'reverse']
Object.extend.map = (fn, ...args) => {
  const f = a => {
    if (a == null) return x => x
    if (a instanceof Function) return a
    if (a instanceof Array) return x => a.map(b => Object.access(x, b))
    return x => Object.access(x, a)
  }
  args[1] = f(args[1])
  return fn(...args)
}
Object.extend.filter = Object.extend.find = Object.extend.findIndex = (fn, ...args) => {
  const f = a => {
    if (a == null) return x => x
    if (a instanceof Function) return a
    if (a instanceof Array) return x => a.some(v => Object.eq(x, v))
    if (a instanceof RegExp) return x => a.test(x)
    if (a instanceof Object) return x => Object.keys(a).every(k => f(a[k])(x[k]))
    return x => Object.eq(x, a) || Object.access(x, a)
  }
  args[1] = f(args[1])
  return fn(...args)
}
Object.extend.sort = (fn, ...args) => {
  const f = a => {
    if (a == null) return default_sort
    if (a instanceof Array) return multi_sort(a)
    if (a instanceof Function && a.length === 1) return (x, y) => default_sort(a(x), a(y))
    if (a instanceof Function && a.length === 2) return a
    return directed_sort(a)
    function default_sort(a, b) {
      if (typeof a !== typeof b) return typeof a > typeof b ? 1 : -1
      if (!a && a !== 0) return a === b ? 0 : -1
      if (!b && b !== 0) return a === b ? 0 : 1
      return a === b ? 0 : a > b ? 1 : -1
    }
    function directed_sort(p, desc = /^-/.test(p)) {
      p = ('' + p).replace(/^[+-]/, '')
      return (a, b) => default_sort(Object.access(a, p), Object.access(b, p)) * (!desc || -1)
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
  args[1] = f(args[1])
  return fn(...args)
}
Object.extend.format = (fn, ...args) => {
  if (['Invalid Date', 'NaN', 'null', 'undefined'].includes('' + args[0])) return '-'
  return fn(...args)
}
Object.extend()
