const xtend = () => {
  for (const primitive of [Boolean, Number, String, Object, Array, Date, RegExp, Function]) {
    for (const fname in xtend[primitive.name]) {
      Object.defineProperty(primitive.prototype, fname, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function() {
          return xtend[primitive.name][fname](this, ...xtend.wrap(arguments, fname))
        },
      })
    }
  }
}
xtend.version = '1.1.1'

xtend.Object = {
  keys: Object.keys,
  values: Object.values,
  entries: Object.entries,
  assign: Object.assign,
  map: (obj, fn) =>
    Object.keys(obj).reduce((acc, k, i) => {
      acc[k] = fn(obj[k], k, i, obj)
      return acc
    }, {}),
  reduce: (obj, fn, base) => Object.keys(obj).reduce((acc, k, i) => fn(acc, obj[k], k, i, obj), base),
  filter: (obj, fn) =>
    Object.keys(obj)
      .filter((k, i) => fn(obj[k], k, i, obj))
      .reduce((acc, k) => {
        acc[k] = obj[k]
        return acc
      }, {}),
  find: (obj, fn) => Object.keys(obj).find((k, i) => fn(obj[k], k, i, obj)),
}

Array._map = [].map
Array._reduce = [].reduce
Array._filter = [].filter
Array._find = [].find
Array._sort = [].sort
xtend.Array = {
  map: (arr, fn) => Array._map.bind(arr)(fn),
  reduce: (arr, fn, base) => Array._reduce.bind(arr)(fn, base),
  filter: (arr, fn) => Array._filter.bind(arr)(fn),
  find: (arr, fn) => Array._find.bind(arr)(fn),
  sort: (arr, fn) => Array._sort.bind(arr.slice())(fn),
  group: (arr, fn) =>
    arr.map(fn).reduce((acc, v, i) => {
      acc[v] = acc[v] || []
      acc[v].push(arr[i])
      return acc
    }, {}),
  unique: arr => [...new Set(arr)],
  first: arr => arr[0],
  last: arr => arr.slice(-1)[0],
  min: arr => arr.slice().sort((a, b) => a - b)[0],
  max: arr => arr.slice().sort((a, b) => b - a)[0],
  sum: arr => arr.reduce((acc, v) => acc + v, 0),
  median: arr => {
    const mid = Math.floor(arr.length / 2)
    const nums = [...arr].sort((a, b) => a - b)
    return arr.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2
  },
  average: arr => arr.reduce((acc, v) => acc + v, 0) / arr.length,
}

xtend.Function = {
  delay: (fn, ms = 0) => {
    fn.timeout = setTimeout(fn, ms)
    return fn
  },
  every: (fn, ms = 0) => {
    fn.timeout = setInterval(fn, ms)
    return fn
  },
  cancel: (fn, ms = 0) => {
    fn.timeout = clearTimeout(fn.timeout)
    return fn
  },
  debounce: (fn, ms = 0) => {
    return function() {
      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => fn.apply(this, arguments), ms)
    }
  },
  throttle: (fn, ms = 0) => {
    return function() {
      if (this.throttle) return
      this.throttle = true
      setTimeout(() => delete this.throttle, ms)
      fn.apply(this, arguments)
    }
  },
  memoize: fn => {
    fn.cache = {}
    return function() {
      const hash = JSON.stringify(arguments)
      if (!fn.cache[hash]) fn.cache[hash] = fn(this, arguments) || 'null-memoize'
      return fn.cache[hash] === 'null-memoize' ? null : fn.cache[hash]
    }
  },
  partial: (fn, ...args) => {
    return function() {
      arguments = Array.from(arguments)
      args = args.map((a, i) => (a === null ? arguments.shift() : a)).concat(arguments)
      return fn.apply(this, args)
    }
  },
}

xtend.String = {
  format: (str, ...args) => {
    args.map((arg, i) => {
      if (typeof arg === 'object')
        return arg.map((v, k) => {
          const name_re = new RegExp('\\{' + k + '\\}', 'g')
          str = str.replace(name_re, v)
        })
      const null_re = /\{\}/
      const position_re = new RegExp('\\{' + i + '\\}', 'g')
      str = str.replace(null_re, arg)
      str = str.replace(position_re, arg)
    })
    return str
  },
  lower: str => str.toLowerCase(),
  upper: str => str.toUpperCase(),
  capitalize: str => str.replace(/./, c => c.toUpperCase()),
  words: (str, clean = /[^a-z0-9-_\s]+/gi, normalize = true) =>
    str
      .normalize(normalize ? 'NFKD' : false)
      .replace(clean, '')
      .replace(/([a-z\d])([A-Z])/g, '$1 $2')
      .split(/[-_\s]/)
      .filter(Boolean),
  join: (str, sep = ' ') => {
    if (sep === 'human') return str.words().join(' ').lower().capitalize()
    if (sep === 'title') return str.words().map('lower.capitalize').join(' ')
    if (sep === 'camel') return str.words().map('lower.capitalize').join('').replace(/./, c => c.toLowerCase())
    if (sep === 'pascal') return str.words().map('lower.capitalize').join('')
    if (['-', 'dash', 'list', 'kebab'].includes(sep)) return str.lower().words().join('-')
    if (['_', 'underscore', 'snake'].includes(sep)) return str.lower().words().join('_')
    str.words().join(sep)
  },
}

xtend.Number = Object.getOwnPropertyNames(Math).reduce((acc, k) => {
  if (typeof Math[k] === 'function') acc[k] = Math[k]
  return acc
}, {})
xtend.Number.format = (num, sep1 = ',', sep2 = '.') => {
  const [int, dec] = ('' + num).split('.')
  return [int.slice(0, int.length % 3)].concat(int.slice(int.length % 3).match(/.../g)).join(sep1) + (dec ? sep2 + dec : '')
}

xtend.Date = {
  format: (date, fmt = 'YYYY-MM-DD', lang = 'en') => {
    const intl = option => date.toLocaleDateString(lang, option)
    if (/,[^ ]/.test(fmt)) {
      const parts = fmt.split(',')
      const options = {}
      if (parts.includes('second')) options.second = '2-digit'
      if (parts.includes('minute')) options.minute = '2-digit'
      if (parts.includes('hour')) options.hour = '2-digit'
      if (parts.includes('weekd')) options.weekday = 'short'
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
  },
  modify: (date, str, sign) => {
    const d = new Date(date)
    const names = ['Seconds', 'Minutes', 'Hours', 'Date', 'Month', 'FullYear']
    let fn = x => x
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
    return d
  },
  plus: (date, str) => date.modify(str, '+'),
  minus: (date, str) => date.modify(str, '-'),
  start: (date, str) => date.modify(str, '<'),
  end: (date, str) => date.modify(str, '>'),
}

// Wrapping function to provide shorthands
xtend.wrap = (args, fname) => {
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

  // If no arguments, use default arguments
  if (args.length === 0) {
    if (['map', 'filter', 'find'].includes(fname)) return [x => x]
    if (['sort'].includes(fname)) return [(a, b) => (a === b ? 0 : a > b ? 1 : -1)]
    return []
  }

  const arg0 = args[0]
  // Dot Accessor shorthand (property or function)
  if (['map', 'filter'].includes(fname)) {
    if (typeof arg0 !== 'function')
      args[0] = x =>
        ('' + arg0).split('.').reduce((x, p) => {
          try {
            return typeof x[p] === 'function' ? x[p]() : x[p]
          } catch (e) {
            return null
          }
        }, x)
  }
  // Same shorthand
  if (['find'].includes(fname)) {
    if (typeof arg0 !== 'function') args[0] = x => same(x, arg0)
  }
  // Sort shorthand
  if (['sort'].includes(fname)) {
    const directed_sort = p => (a, b) => {
      if (!/^-/.test(p)) return a[p] === b[p] ? 0 : a[p] > b[p] ? 1 : -1
      p = p.slice(1)
      return a[p] === b[p] ? 0 : a[p] > b[p] ? -1 : 1
    }
    const multi_sort = p => (a, b) => {
      if (!Array.isArray(p)) return directed_sort(p)(a, b)
      for (k of p) if ((z = directed_sort(k)(a, b))) return z
    }
    if (typeof arg0 !== 'function') args[0] = multi_sort(arg0)
    if (typeof arg0 === 'function' && arg0.length === 1) args[0] = (a, b) => (arg0(a) === arg0(b) ? 0 : arg0(a) > arg0(b) ? 1 : -1)
  }
  return args
}

if (typeof global === 'object' && global.global === global) module.exports = xtend
