### Object.access

`access :: Any (String) -> Any`

Access a property **deep** via a dot object notation on any kind of Object.

This function is used internally to implement shortcut notations for `.map` / `.filter` / `.find` / `.findIndex` / `.sort`

```javascript
const user = await (await fetch('https://api.github.com/users/torvalds')).json()
const repos = await (await fetch('https://api.github.com/users/torvalds/repos')).json()
// Accessing Object
user.access('name') === Object.access(user, 'name')
// Accessing Array
repos.access('0.owner.id')
// Warning: can't access a property containing either a `.` or a `[]`
Object.access({ 'a.b': 1 }, 'a.b')
```

### Object.eq

`eq :: Any (Any) -> Boolean`

Compare any kind of object together, returns true in case of **deep** equality.

This function is used internally to implement shortcut notations for `.filter` / `.find` / `.findIndex`

```javascript
const a = [null, { a: { b: /c/ }, c: [{ d: 1 }] }, new Date('2020')]
const b = [null, { a: { b: /c/i }, c: [{ d: 1 }] }, new Date('2020')]
Object.eq(a, b) === false
JSON.stringify(a) === JSON.stringify(b) // should be false
```

### Object.extend

`extend :: Object (Boolean) -> Array`

This is the core function:
- If called with `true`, extends [Object, Array, Function, String, Number, Date, RegExp] prototypes with their function properties.
- If called with `false|undefined`, add shortcuts to [Object, Array, Function, String, Number, Date, RegExp] function properties.

```javascript
// Adding a function and extending
Array.first = arr => arr[0]
Array.last = arr => arr.slice(-1)[0]
Object.extends(true)
[1, 2, 3].last() === 3

// Adding a shortcut without extending
Object.extend.group = (fn, ...args) => {
  if (args[1] instanceof Array) return args[0].reduce((acc, v) => (args[1].reduce((a, p, i, ds) => a[Object.access(v, p)] = i === ds.length - 1 ? (a[Object.access(v, p)] || []).concat([v]) : a[Object.access(v, p)] || {}, acc), acc), {})
  return fn(...args)
}
Array.group(repos, ['fork', 'licence.key']) // returns an object of depth 1
Object.extend()
Array.group(repos, ['fork', 'licence.key']) // returns an object of depth 2
```

### Object.filter

`filter :: Object (Any) -> Object`

Create a new object with properties that pass the test implemented by the provided function or shortcut.

```javascript
user.filter(/Li/i)
user.filter((v, k) => v > 1000 || k === 'name')
// TODO: user.filter(['name', 'followers'])
```

### Object.find

`find :: Object (Any) -> String|null`

Get the first object property that passes the test implemented by the provided function or shortcut.

```javascript
user.find(/Li/) // returns 'name'
user.find((v, k) => v > 1000 || k === 'name') // returns 'id'
```


### Object.keys

`keys :: Object () -> Array`

Return the object keys.

### Object.map

`map :: Object (Any) -> Object`

Create a new object with values passed thru the provided function or shortcut for each keys.

```javascript
user.map('length')
user.map((v, k) => Number(v) ? v * 100 : k)
```

### Object.reduce

`reduce :: Object (Function, Any) -> Any`

Executes a reducer function on each element of the object, resulting in a single output value.

```javascript
user.reduce((acc, v, k) => {
  if (v > 100) acc.push(v)
  if (k === 'login') acc.push(v)
  return acc
}, [])
```

### Object.values

`values :: Object () -> Array`

Return the object values.

### Array.filter

`filter :: Array (Any) -> Array`

```javascript
repos.filter(v => v.forks > 50)
```

### Array.find

`find :: Array (Any) -> Any`

```javascript
repos.find(v => v.forks > 50)
```

### Array.findIndex

`findIndex :: Array (Any) -> Number|null`

```javascript
repos.findIndex({ name: /linux/i })
```

### Array.group

`group :: Array (Any) -> Any`

```javascript
repos.group('fork')
```

### Array.map

`map :: Array (Any) -> Array`

```javascript
repos.map({ name: 'name', fame: 'forks' })
// TODO: repos.map({ name: 'name', famous: v => v.forks > 1000 })
```

### Array.max

`max :: Array () -> Number`

```javascript
repos.map('forks').max()
```

### Array.mean

`mean :: Array () -> Number`

```javascript
repos.map('forks').mean()
```

### Array.min

`min :: Array () -> Number`

```javascript
repos.map('forks').min()
```

### Array.reduce

`reduce :: Array (Function, Any) -> Any`

```javascript
repos.reduce((acc, v) => {
  acc[v.name] = v.forks
  return acc
}, {})
```

### Array.sort

`sort :: Array (Function) -> Any`

```javascript
repos.sort('forks').map('name')
repos.sort(['fork', '-forks']).map(['fork', 'forks'])
```

### Array.sum

`sum :: Array () -> Number`

```javascript
repos.map('forks').sum()
```

### Array.unique

`unique :: Array () -> Array`

```javascript
repos.map('forks').min()
```

### Function.debounce

`debounce :: Function (Number) -> Void`

```javascript
const sleep = () => console.log('After 1 sec ?')
sleep.debounce(1000)
```

### Function.every

`every :: Function (Number, Number, Boolean) -> This`

### Function.memoize

`memoize :: Function (Function) -> Function`

### Function.partial

`partial :: Function (Any[]) -> Function`

### Function.wait

`wait :: Function (Number) -> This`

### Function.wrap

`wrap :: Function (Function) -> Function`

### String.capitalize

`capitalize :: String () -> String`

### String.format

`format :: String (Any[]) -> String`

### String.join

`join :: String (String) -> String`

### String.lower

`lower :: String () -> String`

### String.upper

`upper :: String () -> String`

### String.words

`words :: String (RegExp|String) -> Array`

### Number.duration

`access :: Number () -> String`

### Number.format

`format :: Number (String) -> String|Number`

### Date.end

`end :: Date (String) -> Date`

### Date.format

`format :: Date (String) -> String`

### Date.getLastDate

`getLastDate :: Date () -> Number`

### Date.getQuarter

`getQuarter :: Date () -> Number`

### Date.getWeek

`getWeek :: Date () -> Number`

### Date.minus

`minus :: Date (String) -> Date`

### Date.modify

`modify :: Date (String, String) -> Date`

### Date.plus

`plus :: Date (String) -> Date`

### Date.relative

`relative :: Date () -> String`

### Date.start

`start :: Date (String) -> Date`

### RegExp.escape

`escape :: RegExp () -> RegExp`

### RegExp.minus

`minus :: RegExp (String) -> RegExp`

### RegExp.plus

`plus :: RegExp (String) -> RegExp`
