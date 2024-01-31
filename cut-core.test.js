import tests from "./cut-bench.test.js"
export const packages = [
  {
    name: "cut",
    versions: ["latest"],
    import: async (version) => {
      window.cut = (await import("./cut.js")).default
      cut.refresh("property")
      return cut
    },
    fn: (module, name) => {
      const [constructor, fname] = name.split(".")
      return window[constructor][fname]
    },
  },
]
export default tests.concat([
  {
    name: "Object.fake",
    force: true,
    fn() {
      cut.Object.fake = () => 1 / 3
      cut.shortcuts.fake = { after: (v) => Math.round(v * 100) }
      cut.refresh("property")
      if (Object.fake() !== 33) throw new Error("Object.fake result is not 33")
    },
  },
  {
    name: "Object.cleanup",
    force: true,
    fn() {
      delete cut.Object.fake
      delete Object.fake
      delete Object.prototype.fake
      for (let property in { a: 1 }) if (property !== "a") throw new Error(`Enumerable property ${property} still exists`)
      if (Number.abs !== Math.abs) throw new Error("Number.abs !== Math.abs")
      cut.refresh()
      if (Object.fake) throw new Error("Object.fake still exists")
      if (Object.prototype.fake) throw new Error("Object.prototype.fake still exists")
      if (Object.prototype.keys) throw new Error("Object.prototype.keys still exists")
      if (Array.prototype._map) throw new Error("Array.prototype._map still exists")
      if (Array.map) throw new Error("Array.map still exists")
      if (Number.abs) throw new Error("Number.abs still exists")
    },
  },
])
