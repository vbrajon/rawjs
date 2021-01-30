### Object.access

`access :: Any (String) -> Any`

Access a property **deep** via a dot object notation on any kind of Object.

This function is used internally to implement shortcut notations for `.map` / `.filter` / `.find` / `.findIndex` / `.sort`

```javascript
user = await (await fetch('https://api.github.com/users/torvalds')).json()
repos = await (await fetch('https://api.github.com/users/torvalds/repos')).json()

Object.access(user, 'name')
// Accessing Object
user.access('name')
// Accessing Array
repos.access('0.owner.id')
// Warning: can't access a property containing either a `.` or a `[]`
Object.access({ 'a.b': 1 }, 'a.b')
```

### Object.equal

`equal :: Any (Any) -> Boolean`

Compare any kind of object together, returns true in case of **deep** equality.

This function is used internally to implement shortcut notations for `.filter` / `.find` / `.findIndex`

```javascript
const a = [null, { a: { b: /c/ }, c: [{ d: 1 }] }, new Date('2020')]
const b = a
b[1].a.b = /diff/
Object.eq(a, b) // false
JSON.stringify(a) === JSON.stringify(b) // true
```

### Object.extend

`extend :: Object (Boolean) -> Array`

This is the core function:
- If called with `true`, extends [Object, Array, Function, String, Number, Date, RegExp] prototypes with their function properties.
- If called with `false|undefined`, add shortcuts to [Object, Array, Function, String, Number, Date, RegExp] function properties.

```javascript
// Adding a function and extending
Array.last = arr => arr.slice(-1)[0]
Object.extends(true)
[1, 2, 3].last() === 3

// Adding a shortcut without extending
Object.extend.shortcuts.max = (fn, ...args) => {
  if (args[1] === true) args[0] = args[0].filter(v => typeof v === 'number')
  return fn(...args)
}
Object.extend()
[1, 2, '3'].max(true)
```

### Object.filter

`filter :: Object (Any) -> Object`

Create a new object with properties that pass the test implemented by the function or shortcut.

```javascript
user.filter(/Li/i)
user.filter((v, k) => v > 1000 || k === 'name')
// TODO: user.filter(['name', 'followers'])
```

### Object.find

`find :: Object (Any) -> String|null`

Returns the value of the first element in the object that satisfies the testing function.

```javascript
user.find(/Li/)
user.find((v, k) => v > 1000 || k === 'name')
```

### Object.find

`find :: Object (Any) -> String|null`

Returns the key of the first element in the object that satisfies the testing function.

```javascript
user.findIndex(/Li/)
user.findIndex((v, k) => v > 1000 || k === 'name')
```

### Object.keys

`keys :: Object () -> Array`

Returns the object keys.

### Object.map

`map :: Object (Any) -> Object`

Creates a new object with every values passed thru the mapping function.

```javascript
user.map('length')
user.map((v, k) => Number(v) ? v * 100 : k)
```

### Object.reduce

`reduce :: Object (Function, Any) -> Any`

Executes a reducer function on each properties of the object, resulting in a single output value.

```javascript
user.reduce((acc, v, k) => {
  if (v > 100) acc.push(v)
  if (k === 'login') acc.push(v)
  return acc
}, [])
```

### Object.values

`values :: Object () -> Array`

Returns the object values.

### Array.filter

`filter :: Array (Any) -> Array`

Creates a new array with all elements that pass the test implemented by the function.

```javascript
repos.filter(v => v.forks > 50)
[1, '3', 2].filter(Number) // [1, 2] // TODO
```

### Array.find

`find :: Array (Any) -> Any`

Returns the value of the first element in the array that satisfies the testing function.

```javascript
repos.find(v => v.forks > 50)
```

### Array.findIndex

Returns the index of the first element in the array that satisfies the testing function.

`findIndex :: Array (Any) -> Number|null`

```javascript
repos.findIndex({ name: /linux/i })
```

### Array.group

`group :: Array (Any) -> Any`

Creates a new object with keys equals to elements passed thru the grouping function and values an array of elements.

```javascript
repos.group('fork')
```

### Array.map

Creates a new array with every elements passed thru the mapping function.

`map :: Array (Any) -> Array`

```javascript
repos.map({ name: 'name', fame: 'forks' })
// TODO: repos.map({ name: 'name', famous: v => v.forks > 1000 })
```

### Array.max

Returns the max

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
const log = () => console.log('It will never be called')
setInterval(log.debounce(1000), 100)
```

### Function.every

`every :: Function (Number, Number, Boolean) -> This`

```javascript
const log = () => console.log('It will never be called')
log.every(100)
```

### Function.memoize

`memoize :: Function (Function) -> Function`

```javascript
const log = () => console.log('It will be called once only with the same signature')
const logmem = log.memoize()
logmem(1)
logmem(1)
```

### Function.partial

`partial :: Function (Any[]) -> Function`

```javascript
const log = (a, b, c) => console.log(a, b, c)
const logp = log.partial('a!', null, 'c!')
logp(1) // a! 1 c!
```

### Function.wait

`wait :: Function (Number) -> This`

```javascript
const log = () => console.log('It will be called once after a delay')
log.wait(1000)
```

### Function.decorate

`decorate :: Function (Function) -> Function`

```javascript
const log = () => console.log('It will be called if first argument is true')
const logdecorate = log.decorate((fn, ...args) => args[0] && fn())
logdecorate()
logdecorate(true)
```

### String.capitalize

`capitalize :: String () -> String`

### String.format

`format :: String (Any[]) -> String`

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
