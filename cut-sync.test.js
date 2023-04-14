import cut from "cut"
import * as lodash from "lodash-es"
// import * as underscore from "underscore"
// import * as ramda from "ramda"
// import * as remeda from "remeda"
import * as datefns from "date-fns"
// import moment from "moment"
import { Temporal } from "@js-temporal/polyfill"
const users = [
  { name: "John Doe", age: 29 },
  { name: "Jane Doe", age: 22 },
  { name: "Janette Doe", age: 22 },
  { name: "Johnny Doe", age: 71, birthdate: new Date("Feb 26, 1932") },
]
const user = users[0]
const userAges = users.map((v) => v.age)
const userAgesAsc = [users[1], users[2], users[0], users[3]]
const str = "i_am:\nThe1\tAND, Only."
const date = new Date("2019-01-20T10:09:08")
const mixed = [[], -1, /a/gi, 0, Infinity, NaN, new Date("2020"), { a: [{ b: 1 }] }, "a", false, null, true, undefined]
const mixedClone = [[], -1, /a/gi, 0, Infinity, NaN, new Date("2020"), { a: [{ b: 1 }] }, "a", false, null, true, undefined]
// const shuffle = (arr, r) => (arr.forEach((v, i) => ((r = Math.floor(Math.random() * i)), ([arr[i], arr[r]] = [arr[r], arr[i]]))), arr)
// const mixedNative = [[], -1, /a/gi, 0, Infinity, NaN, new Date('2020'), { a: [{ b: 1 }] }, 'a', false, null, true, x => x, undefined]
// const mixedShuffled = shuffle([[], -1, /a/gi, 0, Infinity, NaN, new Date('2020'), { a: [{ b: 1 }] }, 'a', false, null, true, x => x, undefined])

export default [
  // Object
  {
    name: "Object.map",
    tests: [{ input: [user, (v) => v * 2 || v], output: { name: "John Doe", age: 58 } }],
    vanilla: (obj, fn) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fn(v, k, obj)])),
    cut: cut.Object.map,
    // lodash: lodash.map,
  },
  {
    name: "Object.filter",
    tests: [{ input: [user, Number], output: { age: 29 } }],
    vanilla: (obj, fn) => Object.fromEntries(Object.entries(obj).filter(([k, v]) => fn(v, k, obj))),
    cut: cut.Object.filter,
    // lodash: lodash.filter,
  },
  {
    name: "Object.find",
    tests: [{ input: [user, (v) => v > 10], output: 29 }],
    vanilla: (obj, fn) => obj[Object.keys(obj).find((k, i, ks) => fn(obj[k], k, obj, i, ks))],
    cut: cut.Object.find,
    lodash: lodash.find,
  },
  {
    name: "Object.findIndex",
    tests: [{ input: [user, (v) => v === 29], output: "age" }],
    vanilla: (obj, fn) => Object.keys(obj).find((k, i, ks) => fn(obj[k], k, obj, i, ks)),
    cut: cut.Object.findIndex,
    lodash: lodash.findKey,
  },
  {
    name: "Object.reduce",
    tests: [
      { input: [user, (acc, v, k) => ((acc[v] = k), acc), {}], output: { "John Doe": "name", 29: "age" } },
      { input: [user, (acc, v, k) => Object.assign(acc, { [v]: k }), {}], output: { "John Doe": "name", 29: "age" } }, //* compare performance
    ],
    vanilla: (obj, fn, base = null) => Object.entries(obj).reduce((acc, [k, v], i, ks) => fn(acc, v, k, obj, i, ks), base),
    cut: cut.Object.reduce,
    lodash: lodash.reduce,
  },
  {
    name: "Object.access",
    cut: cut.Object.access,
    // lodash: lodash.get,
    tests: [
      { input: [{ a: { b: [1, 2, 3] } }, ["a", "b", "length"]], output: 3 },
      { input: [{ a: { b: [1, 2, 3] } }, "a.b.length"], output: 3 },
      { input: [{ a: { b: [1, 2, 3] } }, ".a.b.length"], output: 3 }, // != lodash
      { input: [{ a: { b: [1, 2, 3] } }, '["a"]["b"].length'], output: 3 },
      { input: [{ a: { b: [1, 2, 3] } }, { a: "a.b", b: "a.b.length" }], output: { a: [1, 2, 3], b: 3 } }, // != lodash
      { input: [[{ a: { b: [1, 2, 3] } }], "0.a.b.length"], output: 3 },
      { input: [{ a: { "b.c": 1 } }, 'a["b.c"]'], output: 1 },
      { input: [{ a: { b: 1 } }, "a.b"], output: 1 },
      { input: [{ a: { b: 1 } }, ["a", "b"]], output: 1 },
      { input: [{ "a.b": 1 }, "a.b"], output: 1 },
      { input: [{ "a.b": 1 }, ["a", "b"]], output: undefined },
      { input: [{ "a.b": 1 }], output: { "a.b": 1 } }, // != lodash
      { input: [{ "a.b": 1 }, null], output: { "a.b": 1 } }, // != lodash
      { input: [{ "a.b": 1 }, undefined], output: { "a.b": 1 } }, // != lodash
      { input: [1, 1], output: undefined },
      { input: [], output: undefined },
    ],
  },
  {
    name: "Object.equal",
    cut: cut.Object.equal,
    // lodash: lodash.isEqual,
    tests: [
      { input: [[null, null], [null, undefined]], output: false }, // prettier-ignore
      { input: [{ a: 1 }, { a: 1 }], output: true },
      { input: [{ a: 1 }, { a: 1, b: 2 }], output: false },
      { input: [mixed, mixedClone], output: true },
      { input: [(x) => x, (x) => x], output: true }, // != lodash
      { input: [], output: true },
    ],
  },
  {
    name: "Object.traverse",
    cut: cut.Object.traverse,
    tests: [
      { input: [1, (v) => v * 2], output: 2 }, //* works also with primitives
      { input: [[1], (v) => v * 2], output: [2] }, //* equivalent to map when depth = 1
      { input: [{ a: 1 }, (v) => v * 2], output: { a: 2 } }, //* equivalent to map when depth = 1
      { input: [{ a: 1, b: { c: 2, d: [3] } }, (v) => v * 2], output: { a: 2, b: { c: 4, d: [6] } } },
      { input: [{ a: 1, b: { c: 2, d: [3] } }, (v, path) => `${path.join(".")}=${v}`], output: { a: "a=1", b: { c: "b.c=2", d: ["b.d.0=3"] } } },
    ],
  },
  // {
  //   name: "Object.difference",
  //   cut1(a, b) {
  //     const diffs = {}
  //     Object.traverse(a, (v, path) => {
  //       const v2 = Object.access(b, path)
  //       if (v === v2) return
  //       diffs[path.join(".")] = [v, v2]
  //     })
  //     Object.traverse(b, (v2, path) => {
  //       const v = Object.access(a, path)
  //       if (v === v2) return
  //       diffs[path.join(".")] = [v, v2]
  //     })
  //     return diffs
  //   },
  //   cut2(a, b) {
  //     const va = {}
  //     const vb = {}
  //     Object.traverse(a, (v, path) => (va[path.join(".")] = v))
  //     Object.traverse(b, (v, path) => (vb[path.join(".")] = v))
  //     return Object.filter(Object.map({ ...va, ...vb }, (v, k) => (va[k] === vb[k] ? null : [va[k], vb[k]])))
  //   },
  //   tests: [
  //     { input: [{ a: 1, b: 2, c: 3, d: { e: [4, 5] } }, { b: 1, c: 3, d: { e: [5, 5] }, f: 6 }], output: { a: [1, undefined], b: [2, 1], 'd.e.0': [4, 5], f: [undefined, 6] } }, // prettier-ignore
  //   ],
  // },
  // Array
  {
    name: "Array.map",
    cut: cut.Array.map,
    tests: [
      { input: [[null, "a", undefined, /a/]], output: [null, "a", undefined, /a/] },
      { input: [[{ a: 1, b: 2 }, { a: 3, b: 4 }], "a"], output: [1, 3] }, // prettier-ignore
      { input: [[{ a: 1, b: 2 }, { a: 3, b: 4 }], ["a", "b"]], output: [[1, 2], [3, 4]] }, // prettier-ignore
      { input: [[{ a: 1, b: 2 }, { a: 3, b: 4 }], { a: "b" }], output: [{ a: 2 }, { a: 4 }] }, // prettier-ignore
    ],
  },
  {
    name: "Array.reduce",
    cut: cut.Array.reduce,
    // vanilla: (arr, ...args) => arr.reduce(...args),
    tests: [
      { input: [users, (acc, v, i) => acc.concat(i), []], output: [0, 1, 2, 3] },
      { input: [users, (acc, v, i) => ((acc[i] = v), acc), []], output: users },
    ],
  },
  {
    name: "Array.filter",
    cut: cut.Array.filter,
    tests: [
      { input: [[null, "a", undefined, /a/]], output: ["a", /a/] },
      {
        input: [users, { name: /Ja/ }],
        output: [
          { name: "Jane Doe", age: 22 },
          { name: "Janette Doe", age: 22 },
        ],
      },
      { input: [users, "name"], output: users },
      {
        input: [
          [{ a: 1 }, { a: 2 }, { a: 3, b: 3 }],
          [{ a: (x) => x > 2 }, { b: 3 }, { a: 2 }],
        ],
        output: [{ a: 2 }, { a: 3, b: 3 }],
      },
    ],
  },
  {
    name: "Array.find",
    cut: cut.Array.find,
    tests: [
      { input: [users, { name: /Ja/ }], output: { name: "Jane Doe", age: 22 } },
      { input: [[{ a: 1 }], { a: 1 }], output: { a: 1 } },
      { input: [[{ a: 1 }, { a: 2 }], { a: [2, 3] }], output: { a: 2 } },
    ],
  },
  {
    name: "Array.findIndex",
    cut: cut.Array.findIndex,
    tests: [{ input: [[{ a: 1 }], { a: 1 }], output: 0 }],
  },
  {
    name: "Array.group",
    cut: cut.Array.group,
    tests: [
      { input: [users, (v) => "x"], output: { x: users } },
      { input: [[{ a: 1 }], "a"], output: { 1: [{ a: 1 }] } },
      { input: [[{ a: 1 }], "b"], output: { undefined: [{ a: 1 }] } },
      { input: [[{ a: 1, b: 2 }, { a: 1, b: 2 }], ["a", "b"]], output: { 1: { 2: [{ a: 1, b: 2 }, { a: 1, b: 2 }] } } }, // prettier-ignore
    ],
  },
  {
    vanilla: (arr) => arr.slice().reverse(),
    name: "Array.reverse",
    cut: cut.Array.reverse,
    tests: [{ input: [[1, 2, 3]], output: [3, 2, 1] }],
  },
  {
    name: "Array.sort",
    cut: cut.Array.sort,
    tests: [
      { input: [userAges], output: [22, 22, 29, 71] },
      { input: [users, "age"], output: userAgesAsc },
      { input: [users, (v) => v.age], output: userAgesAsc },
      { input: [users, (a, b) => (a.age === b.age ? 0 : a.age > b.age ? 1 : -1)], output: userAgesAsc },
      { input: [users, function() { return arguments[0].age === arguments[1].age ? 0 : arguments[0].age > arguments[1].age ? 1 : -1 }], output: userAgesAsc }, // prettier-ignore
      { input: [[[null, 1], [1, 2], [null, 3]], [0, -1]], output: [[1, 2], [null, 3], [null, 1]]}, // prettier-ignore
      { input: [[[null, 1], [1, 2], [null, 3]], [v => v[0], -1]], output: [[1, 2], [null, 3], [null, 1]]}, // prettier-ignore
      { input: [[[null, 1], [1, 2], [null, 3]], [4, 5]], output: [[null, 1], [1, 2], [null, 3]]}, // prettier-ignore
      {
        input: (fn) => fn(users, ["-age", "name"]).map((v) => [v.age, v.name]),
        output: [
          [71, "Johnny Doe"],
          [29, "John Doe"],
          [22, "Jane Doe"],
          [22, "Janette Doe"],
        ],
      },
      {
        input: [["10 arbres", "3 arbres", "réservé", "Cliché", "Premier", "communiqué", "café", "Adieu"], "fr", { numeric: true }],
        output: ["3 arbres", "10 arbres", "Adieu", "café", "Cliché", "communiqué", "Premier", "réservé"],
      },
    ],
  },
  {
    name: "Array.unique",
    cut: cut.Array.unique,
    tests: [{ input: [userAges], output: [29, 22, 71] }],
  },
  {
    name: "Array.sum",
    cut: cut.Array.sum,
    tests: [{ input: [userAges], output: 144 }],
  },
  {
    name: "Array.min",
    cut: cut.Array.min,
    tests: [{ input: [userAges], output: 22 }],
  },
  {
    name: "Array.max",
    cut: cut.Array.max,
    tests: [{ input: [userAges], output: 71 }],
  },
  {
    name: "Array.mean",
    cut: cut.Array.mean,
    tests: [{ input: [userAges], output: 36 }],
  },
  {
    name: "Array.median",
    cut: cut.Array.median,
    tests: [
      { input: [userAges], output: 25.5 },
      { input: [[1, 2, 3]], output: 2 },
    ],
  },
  // Function
  {
    name: "Function.decorate",
    cut: cut.Function.decorate,
    tests: [
      { input: (fn) => fn((x) => x)(1), output: 1 },
      { input: (fn) => fn((x) => x, () => 2)(1), output: 2 }, // prettier-ignore
      { input: (fn) => fn((x) => x, { around: (fn, x) => fn(x * 2) * 2 })(1), output: 4 },
      { input: (fn) => fn((x) => x, { before: (x) => x * 2 })(1), output: 2 },
      { input: (fn) => fn((x) => x, { before: () => null })(1), output: null },
      { input: (fn) => fn((x) => x, { after: (x) => x * 2 })(1), output: 2 },
      {
        input: (fn) => {
          const decorated = fn((x) => x, {})
          decorated.around = (fn, x) => 10
          return decorated()
        },
        output: 10,
      },
    ],
  },
  {
    name: "Function.promisify",
    cut: cut.Function.promisify,
    tests: async (fn) => {
      const expect1callback = (v, cb) => (v === 1 ? cb(null, "OK") : cb("KO", null))
      const promisified = fn(expect1callback)
      if ((await promisified(1)) !== "OK") throw new Error("Function.promisify should resolve the callback with the first argument")
      if ((await promisified(2).catch((e) => e)) !== "KO") throw new Error("Function.promisify should reject the callback with the second argument")
    },
  },
  {
    name: "Function.partial",
    cut: cut.Function.partial,
    tests: [{ input: (fn) => fn((a, b) => [a, b], null, 2)(1), output: [1, 2] }],
  },
  {
    name: "Function.memoize",
    cut: cut.Function.memoize,
    tests: [
      {
        input: (fn) => {
          const memory = fn((x) => x / 2)
          memory(2)
          memory(2)
          return memory.cache["[2]"]
        },
        output: 1,
      },
    ],
  },
  // String
  {
    name: "String.lower",
    cut: cut.String.lower,
    lodash: lodash.toLower,
    tests: [{ input: ["A.B"], output: "a.b" }],
  },
  {
    name: "String.upper",
    cut: cut.String.upper,
    lodash: lodash.toUpper,
    tests: [{ input: ["a.b"], output: "A.B" }],
  },
  {
    name: "String.capitalize",
    cut: cut.String.capitalize,
    lodash: lodash.capitalize,
    tests: [{ input: ["A.B"], output: "A.b" }],
  },
  {
    name: "String.words",
    cut: cut.String.words,
    lodash: lodash.words,
    tests: [{ input: [str], output: ["i", "am", "The", "1", "AND", "Only"] }],
  },
  {
    name: "String.format",
    cut: cut.String.format,
    tests: [
      { input: [str], output: "I Am The 1 And Only" },
      { input: [str, "title"], output: "I Am The 1 And Only" },
      { input: [str, "dash"], output: "i-am-the-1-and-only" },
      { input: [str, "underscore"], output: "i_am_the_1_and_only" },
      { input: [str, "camel"], output: "iAmThe1AndOnly" },
      { input: [str, "pascal"], output: "IAmThe1AndOnly" },
      { input: ["{}{}{}", 0, 1, 2], output: "012" },
      { input: ["{}{}{}", "a", "b"], output: "ab" },
      { input: ["{}{}{}", ["a", "b"]], output: "ab" },
      { input: ["{1}{1}{1}{0}{0}", "a", "b"], output: "bbbaa" },
      { input: ["{2}{2}{2}{1}{1}", ["a", "b", ""]], output: "bb" },
      { input: ["{}{}{}{1}{1}{1}{0}{0}", "a", "b"], output: "abbbbaa" },
      { input: ["{user.name} is <strong>{{user.age}}</strong>", { user }], output: "John Doe is <strong>{29}</strong>" },
      { input: ["{.length} users starting with {0.name} & {1.name}", users], output: "4 users starting with John Doe & Jane Doe" },
      { input: ["{k2}{k2}{k3}", { k1: "a", k2: "b" }], output: "bb" },
      { input: ["{66} pears x {3} apples", (x, i) => +x + i], output: "66 pears x 4 apples" },
    ],
  },
  // Number
  {
    name: "Number.format",
    cut: cut.Number.format,
    tests: [
      { input: [0.1 * 3 * 1000], output: 300 },
      { input: [-0.000123456789, 1], output: "-100µ" },
      { input: [123456789000, 2], output: "120G" },
      { input: [1, 10], output: "1" },
      { input: [1010.0101, "en"], output: "1,010.01" },
      { input: [1010.0101, "fr"], output: "1 010,01" },
    ],
  },
  {
    name: "Number.duration",
    cut: cut.Number.duration,
    tests: [
      { input: [-36666666], output: "-10 hours" },
      { input: [1], output: "1 millisecond" },
      { input: [0], output: "" },
    ],
  },
  // Date
  {
    name: "Date.format",
    cut: cut.Date.format,
    tests: [
      { input: [date], output: "2019-01-20T10:09:08+01:00" },
      { input: [date, "DD/MM/YYYY hhhmmmsssSSSZ"], output: "20/01/2019 10h09m08s000+01:00" },
      { input: [date, "QQ WW"], output: "Q1 W3" },
      { input: [date, "day, month, year", "fr"], output: "20 janvier 2019" },
      { input: [date, "month, day, weekday, hour, minute, second"], output: "Sunday, January 20 at 10:09:08 AM" },
      { input: [date, "mon, wday, hour"], output: "Jan Sun, 10 AM" },
      { input: [date, "hour, minute, second"], output: "10:09:08" },
      { input: [date, "hour"], output: "10:09:08" },
      { input: [date, "minute"], output: "09:08" },
      { input: [date, "second"], output: "08" },
      { input: [new Date("2019-01-01 00:00"), "YYYY-MM-DD hh:mm:ss Z"], output: "2019-01-01 00:00:00 +01:00" },
      { input: [new Date("Invalid"), "mon, wday, hour, minute"], output: "-" },
      { input: [new Date("Invalid"), "YYYY/MM/DD"], output: "-" },
    ],
  },
  {
    name: "Date.getWeek",
    cut: cut.Date.getWeek,
    vanilla: (date) => Temporal.PlainDate.from({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() }).weekOfYear,
    // moment: (date) => moment(date).week(), //! output != from vanilla
    // datefns: datefns.getWeek, //! output != from vanilla
    tests: [
      { input: [new Date("2016-11-05")], output: 44 }, // https://en.wikipedia.org/wiki/ISO_week_date#Calculating_the_week_number_from_a_month_and_day_of_the_month
      { input: [new Date("2000-01-01")], output: 52 }, // Saturday, Leep year
      { input: [new Date("2000-01-02")], output: 52 },
      { input: [new Date("2000-01-03")], output: 1 },
      { input: [new Date("2000-01-04")], output: 1 },
      { input: [new Date("2000-01-11")], output: 2 },
      { input: [new Date("2000-01-19")], output: 3 },
      { input: [new Date("2000-01-27")], output: 4 },
      { input: [new Date("2000-02-04")], output: 5 },
      { input: [new Date("2000-02-12")], output: 6 },
      { input: [new Date("2000-09-17")], output: 37 },
      { input: [new Date("2000-12-17")], output: 50 },
      { input: [new Date("2000-12-24")], output: 51 },
      { input: [new Date("2000-12-31")], output: 52 },
      { input: [new Date("2001-01-01")], output: 1 }, // Monday
      { input: [new Date("2002-01-01")], output: 1 }, // Tuesday
      { input: [new Date("2003-01-01")], output: 1 }, // Wednesday
      { input: [new Date("2004-01-01")], output: 1 }, // Thursday, Leep year
      { input: [new Date("2004-12-31")], output: 53 }, // Friday, Leep year
      { input: [new Date("2005-01-01")], output: 53 }, // Saturday
      { input: [new Date("2006-01-01")], output: 52 }, // Sunday
    ],
  },
  {
    name: "Date.getQuarter",
    cut: cut.Date.getQuarter,
    tests: [{ input: [new Date("2018-04-01")], output: 2 }],
  },
  {
    name: "Date.getTimezone",
    cut: cut.Date.getTimezone,
    tests: [
      { input: [null, -540], output: "+09:00" },
      { input: [null, +240], output: "-04:00" },
    ],
  },
  {
    name: "Date.plus",
    cut: cut.Date.plus,
    // datefns: datefns.add,
    tests: [
      { input: [new Date("2020-01-01T00:00:00"), { years: 1, months: 1, hours: 1, minutes: 2, seconds: 3 }], output: new Date("2021-02-01T01:02:03") },
      { input: [new Date("2018-11-30"), { months: 3 }], output: new Date("2019-02-28") },
      { input: [new Date("2018-12-31"), { months: 1 }], output: new Date("2019-01-31") },
      { input: [new Date("2020-01-01"), { months: 1 }], output: new Date("2020-02-01") },
      { input: [new Date("2020-01-31"), { months: 1 }], output: new Date("2020-02-29") },
      { input: [new Date("2020-01-31"), "month"], output: new Date("2020-02-29") },
      { input: [new Date("2020-02-29"), { months: 1 }], output: new Date("2020-03-29") },
      { input: [new Date("2020-03-31"), { months: -1 }], output: new Date("2020-02-29") },
      { input: [new Date("2016-02-29"), { years: 1.2 }], output: new Date("2017-02-28") },
      { input: [new Date("2016-02-29"), { years: "1.2" }], output: new Date("2017-02-28") },
      { input: [new Date("2016-02-29")], output: new Date("2016-02-29") },
      { input: [new Date("2016-02-29"), { year: 10 }], output: new Date("2016-02-29") }, //* ignored options without plural
      { input: [new Date("2016-02-29"), { years: null }], output: new Date("2016-02-29") }, //* ignored
      { input: [new Date("2016-02-29"), { years: 0 }], output: new Date("2016-02-29") }, //* ignored
      { input: [new Date("2016-02-29"), { ignored: 1, milliseconds: 1, and: 1, quarters: 1 }], output: new Date("2016-02-29") }, //* ignored additional properties
      { input: [new Date("2020-01-01"), { months: 1.2 }], output: new Date("2020-02-01") }, //* Expected behavior
      { input: [new Date("2020-01-31"), "1.2 month"], output: new Date("2020-02-29") }, //* Expected behavior //! DEPRECATED syntax
      { input: [new Date("2020-01-01T00:00:00"), "1 year, 1 month, 1 hour - 2 minute - 3 seconds"], output: new Date("2021-02-01T01:02:03") }, //! DEPRECATED syntax
    ],
  },
  {
    name: "Date.minus",
    cut: cut.Date.minus,
    // datefns: datefns.sub,
    tests: [
      { input: [new Date("2020-01-01"), "1 month"], output: new Date("2019-12-01") },
      { input: [new Date("2020-02-29"), "1 year"], output: new Date("2019-02-28") },
      { input: [new Date("2018-11-30"), "-3 month"], output: new Date("2019-02-28") }, //* Subtract negative number
    ],
  },
  {
    name: "Date.start",
    cut: cut.Date.start,
    tests: [{ input: [new Date("2018-02-28T04:05:00"), "month"], output: new Date("2018-02-01T00:00:00") }],
  },
  {
    name: "Date.end",
    cut: cut.Date.end,
    tests: [{ input: [new Date("2016-02-29T10:11:12"), "year"], output: new Date("2016-12-31T23:59:59") }],
  },
  {
    name: "Date.relative",
    cut: cut.Date.relative,
    tests: [
      { input: [date, date], output: "" },
      { input: [new Date(+date - 1000), date], output: "1 second ago" }, //* 1 second before
      { input: [new Date(+date + 2 * 60 * 60 * 1000), date], output: "2 hours from now" }, //* 2 hours after
    ],
  },
  // RegExp
  {
    name: "RegExp.escape",
    cut: cut.RegExp.escape,
    tests: [{ input: (fn) => fn(/john@gmail.com/).source, output: "john@gmail\\.com" }],
  },
  {
    name: "RegExp.plus",
    cut: cut.RegExp.plus,
    tests: [{ input: (fn) => fn(/QwErTy/, "i").flags, output: "i" }],
  },
  {
    name: "RegExp.minus",
    cut: cut.RegExp.minus,
    tests: [{ input: (fn) => fn(/QwErTy/, "i").flags, output: "" }],
  },
]
