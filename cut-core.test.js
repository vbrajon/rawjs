import tests from "./cut-sync.test.js"
export const packages = [
  {
    name: "cut",
    versions: ["latest"],
    import: async () => {
      const cut = (await import("./cut.js")).default
      cut.Object.fake = () => 1 / 3
      cut.shortcuts.fake = { after: (v) => Math.round(v * 100) }
      cut.refresh("global")
      return cut
    },
    fn: (module, name) => {
      const [constructor, fname] = name.split(".")
      return window[constructor][fname]
    },
  },
]
export default tests.concat([["Object.fake", ["anything", "really"], 33]])
