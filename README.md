RawJS is a utility library to simplify data manipulation and formatting.

It let you do:

```javascript
timeserie.filter((v, k) => k > '2010' && v > 80)
users.sort('-age').find({ name: /^J/ }).age
users.group('age').map('length')
(() => console.log(new Date())).throttle(2000).every(100)
'Python {} this {}'.format('calls', 'f-string').join('snake')
(12345.6789).format('fr')
new Date('2020').end('month').plus('2 days').format('year, month, day', 'ru')
/The Matrix (1999)/.escape().plus('i').test('the matrix (1999)')
```

It is lightweight (<4k gzipped) and expose a simple API:

```javascript
| Object | Array     | Function | String     | Number   | Date        | RegExp |
| ------ | --------- | -------- | ---------- | -------- | ----------- | ------ |
| keys   | map       | wrap     | format     | duration | relative    | escape |
| values | reduce    | partial  | lower      | format   | getWeek     | plus   |
| map    | filter    | every    | upper      | -        | getQuarter  | minus  |
| reduce | find      | wait     | capitalize | -        | getLastDate | -      |
| filter | findIndex | debounce | words      | -        | format      | -      |
| find   | sort      | throttle | join       | -        | modify      | -      |
| -      | reverse   | memoize  | -          | -        | plus        | -      |
| -      | group     | -        | -          | -        | minus       | -      |
| -      | unique    | -        | -          | -        | start       | -      |
| -      | sum       | -        | -          | -        | end         | -      |
| -      | mean      | -        | -          | -        | -           | -      |
| -      | median    | -        | -          | -        | -           | -      |
```

It is easily extensible:

```javascript
Array.first = arr => arr[0]
Array.last = arr => arr.slice(-1)[0]
```

It works:

- in the browser:
```javascript
<script src="https://vbrajon.github.io/rawjs/raw.js"></script>
<script>
  String.format('{} rocks!', 'RawJS')
  // OR extending prototypes
  raw()
  '{} rocks!'.format('RawJS')
</script>
```
- in node:
```javascript
// npm i git+https://git@github.com/vbrajon/rawjs.git
require('rawjs')
raw()
'{} rocks!'.format('RawJS')
```
- in the terminal:
```bash
npm i -g git+https://git@github.com/vbrajon/rawjs.git
echo "1+2+3+4+5" | raw # returns evaluated result if it is valid javascript
echo "[1,2,3,4,5]" | raw ".sum()"
echo 1.2.3.4.5 | raw ".split('.').map(d => +d).sum()"
cat users.json | raw ".group('age').map('length')"
```
