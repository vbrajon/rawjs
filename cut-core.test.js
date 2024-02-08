import tests from "./cut-bench.test.js"
import cut from "./cut.js"
export const packages = [
  {
    name: "cut",
    versions: ["latest"],
    import: async (version) => {
      window.cut = (await import("./cut.js")).default
      cut("mode", "prototype")
      return cut
    },
    fn: (module, name) => {
      const [cname, fname] = name.split(".")
      return (x, ...args) => x == null ? cut[cname][fname](x, ...args) : x[fname](...args)
      // return window[cname]?.[fname]
    },
  },
]
export default tests
  .concat([
    {
      name: "core.noMutation",
      force: true,
      fn() {
        const a = [3, 1, 2]
        a.reverse()
        if (a[0] !== 3) throw new Error("Array.reverse mutates the array")
        const shortcut = cut.shortcuts.reverse
        cut("shortcut", "reverse", null)
        a.reverse()
        if (a[0] !== 2) throw new Error("Array.reverse does not mutate the array")
        cut("shortcut", "reverse", shortcut)
      },
    },
    {
      name: "core.setup",
      force: true,
      fn() {
        // cut.Object.fake = () => 1 / 3
        // cut.shortcuts.fake = { after: (v) => Math.round(v * 100) }
        if (cut.mode !== "prototype") throw new Error("cut.mode is not prototype")
        cut("shortcut", "fake", { after: (v) => Math.round(v * 100) })
        cut(Object, "fake", () => 1 / 3)
        if (Object.fake() !== 33) throw new Error("Object.fake result is not 33 " + Object.fake())
        cut(Object, "fake", null)
        cut("shortcut", "fake", null)
        if (Object.fake) throw new Error("Object.fake still exists")
        if (Object.prototype.fake) throw new Error("Object.prototype.fake still exists")
        if (cut.shortcuts.fake) throw new Error("shortcut.fake still exists")
      },
    },
    {
      name: "core.cleanup",
      force: true,
      fn() {
        for (let property in { a: 1 }) if (property !== "a") throw new Error(`Enumerable property ${property} still exists`)
        // if (Number.abs !== Math.abs) throw new Error("Number.abs !== Math.abs")
        cut("mode", "normal")
        if (Object.prototype.keys) throw new Error("Object.prototype.keys still exists")
        if (Object.prototype.map) throw new Error("Object.prototype.map still exists")
        if (Array.prototype._map) throw new Error("Array.prototype._map still exists")
        if (Array.map) throw new Error("Array.map still exists")
        if (Number.abs) throw new Error("Number.abs still exists")
        const a = [3, 1, 2]
        a.reverse()
        if (a[0] !== 3) throw new Error("Array.reverse mutates the array")
      },
    },
  ])
