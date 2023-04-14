import { run } from "cutest"
await run("cut-sync.test.js")
await run("cut-async.test.js", { parallel: true })
await run("cut-sync.test.js", { times: 1000 })
await run("cut-core.test.js", { times: 1000 })
