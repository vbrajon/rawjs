import { run } from "./cutest.bundle.js"

const registry = "https://registry.npmjs.org/"
const unpkg = "https://unpkg.com/"
const esm = "https://esm.sh/"
const versionList = async (pkg) => Object.keys((await (await fetch(registry + pkg)).json()).versions).reverse()
const packages = [
  {
    name: "cut",
    versions: ["latest"],
    import: (version) => import(`./cut.js`),
    fn: (module, name) => {
      const [constructor, fname] = name.split(".")
      return module.default[constructor][fname]
    },
  },
  {
    name: "vanilla",
    versions: ["es2022"],
    import: (version) => import(`${esm}@js-temporal/polyfill`),
    fn: (module, name) => {
      const { Temporal } = module
      return {
        "Object.map": (obj, fn) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fn(v, k, obj)])),
        "Object.filter": (obj, fn) => Object.fromEntries(Object.entries(obj).filter(([k, v]) => fn(v, k, obj))),
        "Object.find": (obj, fn) => obj[Object.keys(obj).find((k, i, ks) => fn(obj[k], k, obj, i, ks))],
        "Object.findIndex": (obj, fn) => Object.keys(obj).find((k, i, ks) => fn(obj[k], k, obj, i, ks)),
        "Array.reduce": (arr, ...args) => arr.reduce(...args),
        "Date.getWeek": (date) => Temporal.PlainDate.from({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() }).weekOfYear,
      }[name]
    },
  },
  {
    name: "lodash-es",
    versions: (await versionList("lodash-es")).filter(v => v.startsWith('4')).slice(-2),
    import: (version) => import(`${unpkg}lodash-es@${version}`),
    fn: (module, name) => {
      const mapping = {
        // "Object.map": "map",
        // "Object.filter": "filter",
        "Object.find": "find",
        "Object.findIndex": "findKey",
        "Object.reduce": "reduce",
        // "Object.access": "get",
        // "Object.equal": "isEqual",
        "String.lower": "toLower",
        "String.upper": "toUpper",
        "String.capitalize": "capitalize",
        "String.words": "words",
      }
      return module[mapping[name]]
    },
  }
]

await run("cut-sync.test.js", { times: 1000, packages })
await run("cut-async.test.js", { parallel: true, packages: packages.slice(0, 1) })
await run("cut-core.test.js", { times: 1000 })
