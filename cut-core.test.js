import cut from "cut"
import scenarios from "./cut-sync.test.js"
cut.list.push([Object, "fake", () => 1 / 3])
cut.shortcuts.fake = { after: (v) => Math.round(v * 100) }
cut.refresh("global")
export default scenarios
  .map((scenario) => {
    scenario.cut = eval(scenario.name)
    return scenario
  })
  .concat([
    {
      name: "Object.fake",
      cut: Object.fake,
      tests: [{ input: ["anything", "really"], output: 33 }],
    },
  ])
