// Object
const path2array = memoize((str) => str.split(/(?:\.|\[["']?([^\]"']*)["']?\])/).filter((x) => x))
export function access(obj, path) {
  if (obj == null || path == null) return obj
  if (Object.prototype.hasOwnProperty.call(obj, path)) return obj[path]
  if (typeof path === "string") return access(obj, path2array(path))
  if (path instanceof Array) return path.reduce((a, p) => (a && a[p] != null ? a[p] : undefined), obj)
  if (path instanceof Function) return path(obj)
  if (path instanceof Object) return map(path, (p) => access(obj, p))
}
export function equal(a, b) {
  if (a === b) return true
  const ta = Object.prototype.toString.call(a)
  if (ta !== Object.prototype.toString.call(b)) return false
  if (!["[object Object]", "[object Array]"].includes(ta)) return a.toString() === b.toString()
  if (Object.keys(a).length !== Object.keys(b).length) return false
  return Object.keys(a).every((k) => equal(a[k], b[k]))
}
export function traverse(obj, fn, path = []) {
  if (obj instanceof Array) return obj.map((v, k) => traverse(v, fn, path.concat(k)))
  if (obj instanceof Object) return map(obj, (v, k) => traverse(v, fn, path.concat(k)))
  return fn(obj, path)
}
export function map(obj, fn) {
  return Object.keys(obj).reduce((acc, k, i) => {
    acc[k] = fn(obj[k], k, i, obj)
    return acc
  }, {})
}
export function reduce(obj, fn, base) {
  return Object.keys(obj).reduce((acc, k, i) => fn(acc, obj[k], k, i, obj), base)
}
export function filter(obj, fn) {
  return Object.keys(obj).reduce((acc, k, i) => {
    if (fn(obj[k], k, i, obj)) acc[k] = obj[k]
    return acc
  }, {})
}
export function find(obj, fn) {
  return obj[Object.keys(obj).find((k, i) => fn(obj[k], k, i, obj))]
}
export function findIndex(obj, fn) {
  return Object.keys(obj).find((k, i) => fn(obj[k], k, i, obj))
}
// Array
export function group(arr, keys) {
  return arr.reduce((acc, v) => {
    keys.reduce((acc, k, i) => {
      const key = access(v, k)
      const last = i === keys.length - 1
      const hasKey = Object.prototype.hasOwnProperty.call(acc, key)
      if (last) return (acc[key] = hasKey ? acc[key].concat([v]) : [v])
      return (acc[key] = hasKey ? acc[key] : {})
    }, acc)
    return acc
  }, {})
}
export function unique(arr) {
  return Array.from(new Set(arr))
}
export function min(arr) {
  return Math.min(...arr)
}
export function max(arr) {
  return Math.max(...arr)
}
export function sum(arr) {
  return arr.reduce((acc, v) => acc + v, 0)
}
export function mean(arr) {
  return arr.reduce((acc, v) => acc + v, 0) / arr.length
}
export function median(arr) {
  const mid = Math.floor(arr.length / 2)
  const nums = arr.slice().sort((a, b) => a - b)
  return arr.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2
}
// Function
export function decorate(fn, options) {
  if (!options || fn.name === "decorated") return fn
  if (options instanceof Function) options = { around: options }
  function decorated(...args) {
    args = decorated.before ? decorated.before(args) : args
    if (!args) return null
    if (!(args instanceof Array)) args = [args]
    const output = decorated.around ? decorated.around(fn, ...args) : fn(...args)
    return decorated.after ? decorated.after(output) : output
  }
  decorated.before = options.before
  decorated.after = options.after
  decorated.around = options.around
  decorated.fn = fn
  return decorated
}
export function promisify(fn) {
  return function promisified(...args) {
    return new Promise((resolve, reject) => fn(...args, (err, val) => (err ? reject(err) : resolve(val))))
  }
}
export function partial(fn, ...outer) {
  return (...inner) => fn(...outer.map((a) => (a === null ? inner.shift() : a)).concat(inner))
}
export function memoize(fn, hash = JSON.stringify) {
  function memoized(...args) {
    const key = hash(args)
    if (!Object.prototype.hasOwnProperty.call(memoized.cache, key)) memoized.cache[key] = fn(...args)
    return memoized.cache[key]
  }
  memoized.cache = {}
  return memoized
}
export function every(fn, ms = 0, repeat = Infinity, immediate = true) {
  if (immediate) fn()
  fn.id = setInterval(function loop() {
    if (--repeat > +immediate) return fn()
    fn.resolve(fn())
    fn.stop()
  }, ms)
  fn.start = Date.now()
  fn.stop = function stop() {
    clearInterval(fn.id)
    delete fn.id
  }
  fn.then = (resolve) => (fn.resolve = resolve)
  return fn
}
export function wait(fn, ms) {
  return every(fn, ms, 1, false)
}
export function debounce(fn, ms = 0) {
  return function debounced() {
    clearTimeout(fn.id)
    fn.id = setTimeout(() => fn(...arguments), ms)
  }
}
export function throttle(fn, ms = 0) {
  return function throttled(...args) {
    fn.next = function next() {
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
}
// String
export function lower(str) {
  return str.toLowerCase()
}
export function upper(str) {
  return str.toUpperCase()
}
export function capitalize(str) {
  return str.toLowerCase().replace(/./, (c) => c.toUpperCase())
}
export function words(str, sep = /[-_,.\s]/) {
  return str
    .normalize("NFKD")
    .replace(RegExp("[^A-z0-9" + sep.source.slice(1, -1) + "]", "g"), "")
    .replace(/([a-z])([A-Z\d])/g, "$1 $2")
    .split(sep)
    .filter((x) => x)
}
export function string_format(str, ...args) {
  if (!args.length) args = ["title"]
  if (["title", "pascal", "camel", "dash", "list", "kebab", "underscore", "snake"].includes(args[0])) {
    let tokens = words(str.toLowerCase())
    let sep = " "
    if (args[0] === "camel") return string_format(str, "pascal").replace(/./, (c) => c.toLowerCase())
    if (["title", "pascal"].includes(args[0])) tokens = tokens.map((v) => v.replace(/./, (c) => c.toUpperCase()))
    if (["pascal"].includes(args[0])) sep = ""
    if (["dash", "list", "kebab"].includes(args[0])) sep = "-"
    if (["underscore", "snake"].includes(args[0])) sep = "_"
    return tokens.join(sep)
  }
  let i = 0
  let fn
  fn = (m) => access(args, m)
  if (typeof args[0] === "object") fn = (m) => access(args[0], m)
  if (typeof args[0] === "function") fn = args.shift()
  return str.replace(/\{[^{}]*\}/g, (m) => String(fn(m.slice(1, -1) || i, i++)).replace(/^(null|undefined)$/, ""))
}
// Number
export function duration(num) {
  if (!num) return ""
  const units = UNITS.slice().reverse()
  const [k, v] = units.find(([k, v]) => v && v <= Math.abs(num))
  return Math.round(+num / +v) + " " + k + (Math.abs(Math.round(+num / +v)) > 1 ? "s" : "")
}
export function number_format(num, format, options) {
  if (format && typeof format === "string") return Intl.NumberFormat(format, options).format(num)
  if (format && typeof format === "number") return num.toExponential(format - 1).replace(/([+-\d.]+)e([+-\d]+)/, (m, n, e) => +(n + "e" + (e - Math.floor(e / 3) * 3)) + (["mµnpfazy", "kMGTPEZY"][+(e > 0)].split("")[Math.abs(Math.floor(e / 3)) - 1] || ""))
  return +num.toPrecision(15)
}
// Date
const UNITS = [
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
UNITS.map(([k, v]) => (UNITS[k.toUpperCase()] = v))
export function relative(from, to = new Date()) {
  return duration(+from - +to).replace(/^-?(.+)/, (m, d) => d + (m[0] === "-" ? " ago" : " from now"))
}
export function getWeek(date) {
  const soy = new Date(date.getFullYear(), 0, 1)
  const doy = Math.floor((+date - +soy) / UNITS.DAY) + 1
  const dow = date.getDay() || 7
  return Math.floor((10 + doy - dow) / 7) || getWeek(new Date(date.getFullYear(), 0, 0))
}
export function getQuarter(date) {
  return Math.ceil((date.getMonth() + 1) / 3)
}
export function getLastDate(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}
export function getTimezone(date, offset = date.getTimezoneOffset()) {
  return `${offset > 0 ? "-" : "+"}${("0" + ~~Math.abs(offset / 60)).slice(-2)}:${("0" + Math.abs(offset % 60)).slice(-2)}`
}
export function date_format(date, format = "YYYY-MM-DDThh:mm:ssZ", lang = "en") {
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
    if (!options.day && !options.month && !options.year) return date_format(date, (options.hour && "hh:mm:ss") || (options.minute && "mm:ss") || "ss")
    return date.toLocaleString(lang, options)
  }
  return UNITS.reduce((str, [k, v, letter, jsfn, zeros = 2]) => {
    return str.replace(RegExp(letter + "+", "g"), (m) => {
      if (letter === "Z") return getTimezone(date)
      if (letter === "W") return "W" + getWeek(date)
      if (letter === "Q") return "Q" + getQuarter(date)
      let int = date["get" + jsfn]()
      if (letter === "M") int = int + 1
      if (m.length > zeros) return ("0".repeat(zeros) + int).slice(-zeros) + letter
      return ("0".repeat(zeros) + int).slice(-m.length)
    })
  }, format)
}
export function modify(date, options, sign) {
  if (!options || !sign) return date
  if (typeof options === "string") {
    options = { str: options }
    options.str.replace(/([+-.\d]*)\s*(second|minute|hour|day|month|year)s?/gi, (m, n, u) => (options[u + "s"] = +n || 1 - +(n === "0")))
  }
  options = Object.fromEntries(
    Object.entries(options)
      .filter(([k, v]) => ["seconds", "minutes", "hours", "days", "months", "years"].includes(k))
      .map(([k, v]) => [k, Math.round(+v)])
  )
  const d = new Date(date)
  const units = UNITS.filter((unit) => ["second", "minute", "hour", "day", "month", "year"].includes(unit[0]))
  const fn = {
    "+": (unit, n) => d["set" + unit[3]](d["get" + unit[3]]() + n),
    "-": (unit, n) => d["set" + unit[3]](d["get" + unit[3]]() - n),
    "<"(unit) {
      const index = units.findIndex((u) => u === unit)
      return units.slice(0, index).map((unit) => d["set" + unit[3]](unit[3] === "Date" ? 1 : 0))
    },
    ">"(unit) {
      const index = units.findIndex((u) => u === unit)
      units
        .slice(0, index)
        .reverse()
        .map((unit) => d["set" + unit[3]]({ Month: 11, Date: getLastDate(d), Hours: 23, Minutes: 59, Seconds: 59 }[unit[3]]))
    },
  }[sign]
  units.forEach((unit) => options[unit[0] + "s"] && fn(unit, options[unit[0] + "s"]))
  d.setMilliseconds(0)
  if (["-", "+"].includes(sign) && date.getDate() !== d.getDate() && ["year", "month"].some((k) => options[k + "s"]) && !["day", "hour", "minute", "second"].some((k) => options[k + "s"])) d.setDate(0)
  if (date.getTimezoneOffset() !== d.getTimezoneOffset()) return new Date(+d + (date.getTimezoneOffset() - d.getTimezoneOffset()) * 60 * 1000)
  return d
}
export function date_plus(date, options) {
  return modify(date, options, "+")
}
export function date_minus(date, options) {
  return modify(date, options, "-")
}
export function start(date, options) {
  return modify(date, options, "<")
}
export function end(date, options) {
  return modify(date, options, ">")
}
// RegExp
export function escape(re) {
  return RegExp(re.source.replace(/([\\/'*+?|()[\]{}.^$-])/g, "\\$1"), re.flags)
}
export function regexp_plus(re, f) {
  return RegExp(re.source, re.flags.replace(f, "") + f)
}
export function regexp_minus(re, f) {
  return RegExp(re.source, re.flags.replace(f, ""))
}
// Promise
export async function promise_map(arr, fn) {
  return await arr.reduce(async (acc, v, i) => (await acc).concat(await fn(v, i, acc)), [])
}
// Core
const cut = {
  constructors: {
    Object,
    Array,
    Function,
    String,
    Number,
    Date,
    RegExp,
    Promise,
  },
  shortcuts: {
    map: {
      before(args) {
        const f = (fn) => {
          if (fn == null) return (x) => x
          if (fn instanceof Function) return fn
          if (fn instanceof Array) return (x) => fn.map((b) => access(x, b))
          return (x) => access(x, fn)
        }
        args[1] = f(args[1])
        return args
      },
    },
    filter: {
      before(args) {
        const f = (fn) => {
          if (fn == null) return (x) => x
          if (fn instanceof Function) return fn
          if (fn instanceof RegExp) return (x) => fn.test(x)
          if (fn instanceof Array) return (x) => fn.some((v) => f(v)(x))
          if (fn instanceof Object) return (x) => Object.keys(fn).every((k) => f(fn[k])(x[k]))
          return (x) => equal(x, fn) || access(x, fn)
        }
        args[1] = f(args[1])
        return args
      },
    },
    sort: {
      before(args) {
        function defaultSort(a, b) {
          if (typeof a !== typeof b) return typeof a > typeof b ? 1 : -1
          if (a == null || a instanceof Object) return 0
          return a === b ? 0 : a > b ? 1 : -1
        }
        function directedSort(p, desc = /^-/.test(p)) {
          p = ("" + p).replace(/^[+-]/, "")
          return (a, b) => defaultSort(access(a, p), access(b, p)) * +(!desc || -1)
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
      before(args) {
        args[1] = [].concat(args[1])
        return args
      },
    },
    format: {
      after(v) {
        if (/(Invalid Date|NaN|null|undefined)/.test(v)) return "-"
        return v
      },
    },
    sum: {
      around(fn, arr, ...args) {
        if (args[0]) return fn(cut.Array.map(arr, args[0]))
        return fn(arr)
      },
    },
  },
  refresh(mode = "shortcut") {
    const { constructors, shortcuts } = this
    const modes = {
      prototype: extend(prototype),
      property: extend(property),
      shortcut: shorcut,
    }
    if (!modes[mode]) throw new Error(`Invalid mode ${mode}, use ${Object.keys(modes).join(" or ")}`)
    Object.entries(constructors).forEach(([name, constructor]) => {
      Object.entries(this[name]).forEach(([fname, fn]) => {
        clean(constructor, fname)
        this[name][fname] = modes[mode](constructor, fname, fn?.fn || fn)
      })
    })
    return this
    function clean(constructor, fname) {
      if (constructor.prototype["_" + fname]) {
        constructor.prototype[fname] = constructor.prototype["_" + fname]
        delete constructor.prototype["_" + fname]
      }
      if (constructor[fname] === Math[fname]) delete constructor[fname]
      if (constructor[fname] && !constructor[fname].toString().includes("[native code]")) delete constructor[fname]
      if (constructor.prototype[fname] && !constructor.prototype[fname].toString().includes("[native code]")) delete constructor.prototype[fname]
    }
    function shorcut(constructor, fname, fn) {
      if (constructor === Array && ["reduce", "map", "filter", "find", "findIndex"].includes(fname)) fn = (x, ...args) => constructor.prototype[fname].call(x, ...args)
      if (constructor === Array && ["sort", "reverse"].includes(fname)) fn = (x, ...args) => constructor.prototype[fname].call(x.slice(), ...args)
      return decorate(fn, shortcuts[fname])
    }
    function prototype(obj, fname, fn) {
      if (obj[fname] === fn) return
      obj[fname] = fn
    }
    function property(obj, fname, fn) {
      if (obj[fname] === fn) return
      Object.defineProperty(obj, fname, {
        writable: true,
        configurable: true,
        value: fn,
      })
    }
    function extend(proto) {
      return function (constructor, fname, fn) {
        if (constructor.prototype[fname]?.toString().includes("[native code]")) proto(constructor.prototype, "_" + fname, constructor.prototype[fname])
        if (constructor === Array && ["reduce", "map", "filter", "find", "findIndex"].includes(fname)) fn = (x, ...args) => constructor.prototype["_" + fname].call(x, ...args)
        if (constructor === Array && ["sort", "reverse"].includes(fname)) fn = (x, ...args) => constructor.prototype["_" + fname].call(x.slice(), ...args)
        if (shortcuts.hasOwnProperty(fname)) fn = decorate(fn, shortcuts[fname])
        try {
          proto(constructor, fname, fn)
        } catch (e) {
          console.error(`${constructor.name}.${fname} not extended: ${e.message}`)
        }
        try {
          proto(constructor.prototype, fname, function () {
            return fn(this, ...arguments)
          })
        } catch (e) {
          console.error(`${constructor.name}.prototype.${fname} not extended: ${e.message}`)
        }
        return fn
      }
    }
  },
  Object: {
    keys: Object.keys,
    values: Object.values,
    entries: Object.entries,
    fromEntries: Object.fromEntries,
    map,
    reduce,
    filter,
    find,
    findIndex,
    access,
    equal,
    traverse,
  },
  Array: {
    map: null,
    reduce: null,
    filter: null,
    find: null,
    findIndex: null,
    sort: null,
    reverse: null,
    group,
    unique,
    min,
    max,
    sum,
    mean,
    median,
  },
  Function: {
    decorate,
    promisify,
    partial,
    memoize,
    every,
    wait,
    debounce,
    throttle,
  },
  String: {
    lower,
    upper,
    capitalize,
    words,
    format: string_format,
  },
  Number: {
    duration,
    format: number_format,
    ...Object.fromEntries(
      Object.getOwnPropertyNames(Math)
        .filter((k) => typeof Math[k] === "function")
        .map((k) => [k, Math[k]])
    ),
  },
  Date: {
    relative,
    getWeek,
    getQuarter,
    getLastDate,
    getTimezone,
    format: date_format,
    modify,
    plus: date_plus,
    minus: date_minus,
    start,
    end,
  },
  RegExp: {
    escape,
    plus: regexp_plus,
    minus: regexp_minus,
  },
  Promise: {
    map: promise_map,
  },
}
cut.shortcuts.find = cut.shortcuts.findIndex = cut.shortcuts.filter
cut.shortcuts.min = cut.shortcuts.max = cut.shortcuts.mean = cut.shortcuts.median = cut.shortcuts.sum
cut.refresh()
export default cut
