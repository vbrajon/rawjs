Object.map = (obj, fn) =>
  Object.keys(obj).reduce((acc, k, i) => {
    acc[k] = fn(obj[k], k, i, obj)
    return acc
  }, {})
Object.reduce = (obj, fn, base) => Object.keys(obj).reduce((acc, k, i) => fn(acc, obj[k], k, i, obj), base)
Object.filter = (obj, fn) =>
  Object.keys(obj).reduce((acc, k, i) => {
    if (fn(obj[k], k, i, obj)) acc[k] = obj[k]
    return acc
  }, {})
Object.find = (obj, fn) => obj[Object.keys(obj).find((k, i) => fn(obj[k], k, i, obj))]
Object.findIndex = (obj, fn) => Object.keys(obj).find((k, i) => fn(obj[k], k, i, obj))

Array.group = (arr, keys) =>
  arr.reduce((acc, v) => {
    keys.reduce((acc, k, i, arr) => {
      const key = Object.access(v, k)
      const last = i === arr.length - 1
      const hasKey = Object.prototype.hasOwnProperty.call(acc, key)
      if (last) return (acc[key] = hasKey ? acc[key].concat([v]) : [v])
      return (acc[key] = hasKey ? acc[key] : {})
    }, acc)
    return acc
  }, {})
Array.unique = (arr) => Array.from(new Set(arr))
Array.min = (arr) => Math.min(...arr)
Array.max = (arr) => Math.max(...arr)
Array.sum = (arr) => arr.reduce((acc, v) => acc + v, 0)
Array.mean = (arr) => arr.reduce((acc, v) => acc + v, 0) / arr.length
Array.median = (arr) => {
  const mid = Math.floor(arr.length / 2)
  const nums = arr.slice().sort((a, b) => a - b)
  return arr.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2
}

// prettier-ignore
Function.decorate = (fn, opts) => {
  const { before = [], after = [], around = [] } = opts instanceof Object ? opts : {}
  if (opts instanceof Function) around.push(opts)
  const f = (...args) => {
    args = f.before.reduce((acc, f) => f(acc), args)
    if (!args) return null
    if (!(args instanceof Array)) args = [args]
    const output = f.around.reduce((acc, fn) => (...args) => fn(acc, ...args), fn)(...args)
    return f.after.reduce((acc, f) => f(acc, args), output)
  }
  f.before = (fn.before || []).concat(before)
  f.after = (fn.after || []).concat(after)
  f.around = (fn.around || []).concat(around)
  f.fn = fn
  return f
}
// prettier-ignore
Function.promisify = (fn, ...args) => new Promise((r) => fn(...args, r))
// prettier-ignore
Function.partial = (fn, ...outer) => (...inner) => fn(...outer.map(a => (a === null ? inner.shift() : a)).concat(inner))
// prettier-ignore
Function.memoize = (fn, hash = JSON.stringify) => {
  const f = (...args) => {
    const key = hash(args)
    if (!Object.prototype.hasOwnProperty.call(f.cache, key)) f.cache[key] = fn(...args)
    return f.cache[key]
  }
  f.cache = {}
  return f
}
// prettier-ignore
Function.every = (fn, ms = 0, repeat = Infinity, immediate = true) => {
  if (immediate) fn()
  fn.id = setInterval(() => {
    if (--repeat > +immediate) return fn()
    fn.resolve(fn())
    fn.stop()
  }, ms)
  fn.stop = () => {
    clearInterval(fn.id)
    delete fn.id
  }
  fn.then = resolve => (fn.resolve = resolve)
  return fn
}
// prettier-ignore
Function.wait = (fn, ms) => Function.every(fn, ms, 1, false)
// prettier-ignore
Function.debounce = (fn, ms = 0) => (...args) => {
  clearTimeout(fn.id)
  fn.id = setTimeout(() => fn(...args), ms)
}
// prettier-ignore
Function.throttle = (fn, ms = 0) => (...args) => {
  fn.next = () => {
    delete fn.next
    fn.id = setTimeout(() => {
      delete fn.id
      if (fn.next) fn.next()
    }, ms)
    fn(...args)
  }
  if (fn.id) return
  fn.next()
}

String.toPath = Function.memoize((str) => str.split(/(?:\.|\[["']?([^\]"']*)["']?\])/).filter((x) => x))
Object.access = (obj, path) => {
  if (obj == null || path == null) return obj
  if (Object.prototype.hasOwnProperty.call(obj, path)) return obj[path]
  if (typeof path === "string") return Object.access(obj, String.toPath(path))
  if (path instanceof Array) return path.reduce((a, p) => (a && a[p] != null ? a[p] : undefined), obj)
  if (path instanceof Function) return path(obj)
  if (path instanceof Object) return Object.map(path, (p) => Object.access(obj, p))
}
Object.equal = (a, b) => {
  if (a === b) return true
  const ta = Object.prototype.toString.call(a)
  if (ta !== Object.prototype.toString.call(b)) return false
  if (!["[object Object]", "[object Array]"].includes(ta)) return a.toString() === b.toString()
  if (Object.keys(a).length !== Object.keys(b).length) return false
  return Object.keys(a).every((k) => Object.equal(a[k], b[k]))
}
Object.traverse = (obj, fn, path = []) => {
  if (obj instanceof Array || obj instanceof Object) return obj.constructor.map(obj, (v, k) => Object.traverse(v, fn, path.concat(k)))
  return fn(obj, path)
}

String.lower = (str) => str.toLowerCase()
String.upper = (str) => str.toUpperCase()
String.capitalize = (str) => str.replace(/./, (c) => c.toUpperCase())
String.words = (str, sep = /[-_,.\s]/) =>
  str
    .normalize("NFKD")
    .replace(RegExp("[^A-z0-9" + sep.source.slice(1, -1) + "]", "g"), "")
    .replace(/([a-z])([A-Z\d])/g, "$1 $2")
    .split(sep)
    .filter((x) => x)
String.format = (str, ...args) => {
  if (!args.length) args = ["title"]
  if (["title", "pascal", "camel", "dash", "list", "kebab", "underscore", "snake"].includes(args[0])) {
    let words = String.words(str).map((v) => v.toLowerCase())
    let sep = " "
    if (args[0] === "camel") return String.format(str, "pascal").replace(/./, (c) => c.toLowerCase())
    if (["title", "pascal"].includes(args[0])) words = words.map((v) => v.replace(/./, (c) => c.toUpperCase()))
    if (["pascal"].includes(args[0])) sep = ""
    if (["dash", "list", "kebab"].includes(args[0])) sep = "-"
    if (["underscore", "snake"].includes(args[0])) sep = "_"
    return words.join(sep)
  }
  let i = 0
  let fn = (m) => Object.access(args, m)
  if (typeof args[0] === "object") fn = (m) => Object.access(args[0], m)
  if (typeof args[0] === "function") fn = args.shift()
  return str.replace(/\{[^{}]*\}/g, (m) => String(fn(m.slice(1, -1) || i, i++)).replace(/^(null|undefined)$/, ""))
}

Object.getOwnPropertyNames(Math)
  .filter((k) => typeof Math[k] === "function")
  .forEach((k) => (Number[k] = Math[k]))
Number.duration = (num) => {
  if (!num) return ""
  const units = Date.UNITS.slice().reverse()
  const [k, v] = units.find(([k, v]) => v && v <= Math.abs(num))
  return Math.round(num / v) + " " + k + (Math.abs(Math.round(num / v)) > 1 ? "s" : "")
}
Number.format = (num, format, options) => {
  if (typeof format === "string") return Intl.NumberFormat(format, options).format(num)
  if (typeof format === "number") return (+num.toPrecision(format)).toExponential().replace(/([+-\d.]+)e([+-\d]+)/, (m, n, e) => +(n + "e" + (e - Math.floor(e / 3) * 3)) + (["mµnpfazy", "kMGTPEZY"][+(e > 0)].split("")[Math.abs(Math.floor(e / 3)) - 1] || ""))
  return +num.toPrecision(15)
}

Date.UNITS = [
  ["millisecond", 1, "S", "Milliseconds", 3],
  ["second", 1000, "s", "Seconds"],
  ["minute", 1000 * 60, "m", "Minutes"],
  ["hour", 1000 * 60 * 60, "h", "Hours"],
  ["day", 1000 * 60 * 60 * 24, "D", "Date"],
  ["week", 1000 * 60 * 60 * 24 * 4, "W", "Week"],
  ["month", 1000 * 60 * 60 * 24 * 30, "M", "Month"],
  ["quarter", 1000 * 60 * 60 * 24 * 30 * 3, "Q", "Quarter", 1],
  ["year", 1000 * 60 * 60 * 24 * 365, "Y", "FullYear", 4],
  ["timezone", null, "Z", "Timezone"],
]
Date.UNITS.map(([k, v]) => (Date[k.toUpperCase()] = v))
Date.relative = (from, to = new Date()) => Number.duration(from - to).replace(/^-?(.+)/, (m, d) => d + (m[0] === "-" ? " ago" : " from now"))
Date.getWeek = (date) => {
  const soy = new Date(date.getFullYear(), 0, 1)
  const doy = Math.floor((date - soy) / Date.DAY) + 1
  const dow = date.getDay() || 7
  return Math.floor((10 + doy - dow) / 7) || Date.getWeek(new Date(date.getFullYear(), 0, 0))
}
Date.getQuarter = (date) => Math.ceil((date.getMonth() + 1) / 3)
Date.getLastDate = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
Date.getTimezone = (date, offset = date.getTimezoneOffset()) => `${offset > 0 ? "-" : "+"}${("0" + ~~Math.abs(offset / 60)).slice(-2)}:${("0" + Math.abs(offset % 60)).slice(-2)}`
Date.format = (date, format = "YYYY-MM-DDThh:mm:ssZ", lang = "en") => {
  const parts = format.split(",").map((s) => s.trim())
  if (!parts.filter((v) => !["year", "month", "mon", "day", "weekday", "wday", "hour", "minute", "second"].includes(v)).length) {
    const options = {}
    if (parts.includes("second")) options.second = "2-digit"
    if (parts.includes("minute")) options.minute = "2-digit"
    if (parts.includes("hour")) options.hour = "2-digit"
    if (parts.includes("wday")) options.weekday = "short"
    if (parts.includes("weekday")) options.weekday = "long"
    if (parts.includes("day")) options.day = "numeric"
    if (parts.includes("mon")) options.month = "short"
    if (parts.includes("month")) options.month = "long"
    if (parts.includes("year")) options.year = "numeric"
    if (!options.day && !options.month && !options.year) return Date.format(date, (options.hour && "hh:mm:ss") || (options.minute && "mm:ss") || "ss")
    return date.toLocaleString(lang, options)
  }
  return Date.UNITS.reduce((str, [k, v, letter, jsfn, zeros = 2]) => {
    return str.replace(RegExp(letter + "+", "g"), (m) => {
      if (letter === "Z") return Date.getTimezone(date)
      if (letter === "W") return "W" + Date.getWeek(date)
      if (letter === "Q") return "Q" + Date.getQuarter(date)
      let int = date["get" + jsfn]()
      if (letter === "M") int = int + 1
      if (m.length > zeros) return ("0".repeat(zeros) + int).slice(-zeros) + letter
      return ("0".repeat(zeros) + int).slice(-m.length)
    })
  }, format)
}
Date.modify = (date, str, sign) => {
  const d = new Date(date)
  const units = Date.UNITS.filter((unit) => !["millisecond", "week", "quarter", "timezone"].includes(unit[0]))
  const jsfns = units.map((unit) => unit[3])
  let fn
  if (sign === "+") fn = (i, n) => d["set" + jsfns[i]](d["get" + jsfns[i]]() + n)
  if (sign === "-") fn = (i, n) => d["set" + jsfns[i]](d["get" + jsfns[i]]() - n)
  if (sign === "<") fn = (i) => jsfns.slice(0, i).map((jsfn) => d["set" + jsfn](jsfn === "Date" ? 1 : 0))
  if (sign === ">") {
    fn = (i) =>
      jsfns
        .slice(0, i)
        .reverse()
        .map((jsfn) => d["set" + jsfn]({ Month: 11, Date: Date.getLastDate(d), Hours: 23, Minutes: 59, Seconds: 59 }[jsfn]))
  }
  units.map(([unit], i) => str.replace(RegExp(/([+-.\d]*)\s*UNITs?/.source.replace("UNIT", unit), "i"), (m, n) => fn(i, +n || 1 - (n === "0"))))
  d.setMilliseconds(0)
  if (["-", "+"].includes(sign) && date.getDate() !== d.getDate() && /(year|month)/i.test(str) && !/(day|hour|minute|second)/i.test(str)) d.setDate(0)
  return d
}
Date.plus = (date, str) => Date.modify(date, str, "+")
Date.minus = (date, str) => Date.modify(date, str, "-")
Date.start = (date, str) => Date.modify(date, str, "<")
Date.end = (date, str) => Date.modify(date, str, ">")

RegExp.escape = (r) => RegExp(r.source.replace(/([\\/'*+?|()[\]{}.^$-])/g, "\\$1"), r.flags)
RegExp.plus = (r, f) => RegExp(r.source, r.flags.replace(f, "") + f)
RegExp.minus = (r, f) => RegExp(r.source, r.flags.replace(f, ""))

Promise.map = async (arr, fn) => await arr.reduce(async (acc, v, i) => (await acc).concat(await fn(v, i, acc)), [])

// RAW Core functions
Object.extend = (primitive, fname) => {
  if (!primitive) return [Object, Array, Function, String, Number, Date, RegExp].map((primitive) => Object.extend(primitive)).flat()
  const natives = Object.natives.filter((v) => v.startsWith(primitive.name)).map((v) => v.split(".")[1])
  if (!fname) {
    return Array.unique(Object.keys(primitive).concat(natives))
      .map((fname) => Object.extend(primitive, fname))
      .filter((x) => x)
  }
  if (primitive.prototype[fname] && primitive.prototype[fname].toString().includes("[native code]")) {
    primitive.prototype["_" + fname] = primitive.prototype[fname]
    primitive[fname] = (x, ...args) => primitive.prototype["_" + fname].call(x, ...args)
    if (["sort", "reverse"].includes(fname)) primitive[fname] = (x, ...args) => primitive.prototype["_" + fname].call(x.slice(), ...args)
  }
  if (primitive[fname] === Object.extend || !(primitive[fname] instanceof Function)) return
  const fn = primitive[fname].fn || primitive[fname]
  const native = natives.includes(fname)
  const shortcut = Object.keys(Object.shortcuts).includes(fname)
  primitive[fname] = shortcut ? Function.decorate(fn, Object.shortcuts[fname]) : fn
  if (Object.prototypes.includes(primitive)) {
    Object.defineProperty(primitive.prototype, fname, {
      writable: true,
      value: function (...args) {
        return primitive[fname](this, ...args)
      },
    })
  }
  return primitive.name + "." + fname + (native ? "#native" : "") + (shortcut ? "#shortcut" : "")
}
Object.prototypes = Object.prototypes || [Object, Array, Function, String, Number, Date, RegExp]
Object.natives = Object.natives || ["Object.keys", "Object.values", "Object.entries", "Object.fromEntries", "Array.map", "Array.reduce", "Array.filter", "Array.find", "Array.findIndex", "Array.sort", "Array.reverse"]
Object.shortcuts = Object.shortcuts || {
  map: {
    before: (args) => {
      const f = (fn) => {
        if (fn == null) return (x) => x
        if (fn instanceof Function) return fn
        if (fn instanceof Array) return (x) => fn.map((b) => Object.access(x, b))
        return (x) => Object.access(x, fn)
      }
      args[1] = f(args[1])
      return args
    },
  },
  filter: {
    before: (args) => {
      const f = (fn) => {
        if (fn == null) return (x) => x
        if (fn instanceof Function) return fn
        if (fn instanceof RegExp) return (x) => fn.test(x)
        if (fn instanceof Array) return (x) => fn.some((v) => f(v)(x))
        if (fn instanceof Object) return (x) => Object.keys(fn).every((k) => f(fn[k])(x[k]))
        return (x) => Object.equal(x, fn) || Object.access(x, fn)
      }
      args[1] = f(args[1])
      return args
    },
  },
  sort: {
    before: (args) => {
      function defaultSort(a, b) {
        if (typeof a !== typeof b) return typeof a > typeof b ? 1 : -1
        if (a == null || a instanceof Object) return 0
        return a === b ? 0 : a > b ? 1 : -1
      }
      function directedSort(p, desc = /^-/.test(p)) {
        p = ("" + p).replace(/^[+-]/, "")
        return (a, b) => defaultSort(Object.access(a, p), Object.access(b, p)) * (!desc || -1)
      }
      function multiSort(fns) {
        return (a, b) => {
          for (const fn of fns) {
            const z = fn(a, b)
            if (z) return z
          }
        }
      }
      const f = (fn) => {
        if (fn == null) return defaultSort
        if (fn instanceof Array) return multiSort(fn.map(f))
        if (fn instanceof Function && fn.length === 1) return (x, y) => defaultSort(fn(x), fn(y))
        if (fn instanceof Function) return fn
        if (typeof fn === "string" && typeof args[0][0] === "string") return Intl.Collator(fn, { numeric: true, ...args[2] }).compare
        return directedSort(fn)
      }
      args[1] = f(args[1])
      return args
    },
  },
  group: {
    before: (args) => {
      args[1] = [].concat(args[1])
      return args
    },
  },
  format: {
    after: (v) => {
      if (["Invalid Date", "NaN", "null", "undefined"].includes(v)) return "-"
      return v
    },
  },
  modify: {
    before: (args) => {
      if (args[1] instanceof Object)
        args[1] = Object.entries(args[1])
          .map(([k, v]) => v + k)
          .join(" ")
      return args
    },
  },
}
Object.shortcuts.find = Object.shortcuts.findIndex = Object.shortcuts.filter
Object.extend()
