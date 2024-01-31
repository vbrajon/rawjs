[cut](https://github.com/vbrajon/cut) is a shortcut utility library to speed up **data transformation**, **dates manipulation**, **formatting** and **function composition**.  
It is a simpler version of [lodash](https://github.com/lodash/lodash) or [moment](https://github.com/moment/moment/).

## Functions

| Object      | Array     | Function  | String     | Number   | Date        | RegExp | Promise |
| ----------- | --------- | --------- | ---------- | -------- | ----------- | ------ | ------- |
| keys        | map       | decorate  | lower      | duration | relative    | escape | map     |
| values      | reduce    | promisify | upper      | format   | getWeek     | plus   |         |
| entries     | filter    | partial   | capitalize | abs      | getQuarter  | minus  |         |
| fromEntries | find      | memoize   | words      | acos     | getLastDate |        |         |
| map         | findIndex | every     | format     | asin     | getTimezone |        |         |
| reduce      | sort      | wait      |            | atan     | format      |        |         |
| filter      | reverse   | debounce  |            | acosh    | modify      |        |         |
| find        | group     | throttle  |            | asinh    | plus        |        |         |
| findIndex   | unique    |           |            | atanh    | minus       |        |         |
| access      | min       |           |            | atan2    | start       |        |         |
| equal       | max       |           |            | cbrt     | end         |        |         |
| traverse    | sum       |           |            | ceil     |             |        |         |
|             | mean      |           |            | clz32    |             |        |         |
|             | median    |           |            | cos      |             |        |         |
|             |           |           |            | …        |             |        |         |

## Usage

Exemple in node:
```js
import { map, sum, group } from "cut"
const users = [
  { name: "John", age: 25, city: "Paris" },
  { name: "Jane", age: 30, city: "London" },
  { name: "Jack", age: 20, city: "New York" },
]
const names = map(users, "name")
const ageSum = sum(users, "age")
const byCity = group(users, "city")
const populationByCity = map(byCity, "length")
```

Exemple in browser, extending objects prototypes:
```js
const { default: cut } = await import("https://raw.githack.com/vbrajon/rawjs/cut/cut.js")
// extend prototypes
cut.refresh("property")
// then
const users = [
  { name: "John", age: 25, city: "Paris" },
  { name: "Jane", age: 30, city: "London" },
  { name: "Jack", age: 20, city: "New York" },
]
const names = users.map("name")
const ageSum = users.sum("age")
const byCity = users.group("city")
const populationByCity = byCity.map("length")
```

```js
import cut from "cut"
// list functions
const header = Object.keys(cut.constructors)
const table = Array(15)
  .fill()
  .map((_, i) => header.map((k) => (Object.keys(cut[k]).length > i && i === 14 ? "…" : Object.keys(cut[k])[i] || "")))
console.table(table.map((row) => header.reduce((acc, k, i) => ({ ...acc, [k]: row[i] }), {})))
console.log([header, header.map((k) => "-".repeat(15)), ...table].map((row) => "| " + row.map((v) => v.padEnd(15, " ")).join(" | ") + " |").join("\n"))
```

## Development

```bash
bun --watch cutest.js
```

## Roadmap

- [ ] Docs in README: https://github.com/vbrajon/rawjs/tree/cut
- [ ] Docs interactive: https://raw.githack.com/vbrajon/rawjs/cut/index.html
- [ ] Test Viewer/Editor: https://raw.githack.com/vbrajon/rawjs/cut/cutest.html
