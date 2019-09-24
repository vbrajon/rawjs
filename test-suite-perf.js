import './raw.js'
import _ from 'lodash'
import Sugar from 'Sugar'
a = Array(1000).fill().map((_, i) => ({ name: 'John', age: i }))
console.log('Calling ' + (a.length ** 2).toExponential() + ' functions')

// vanilla
'vanilla'
// lodash
'lodash ' + _.VERSION
// sugar
'sugar ' + Sugar.VERSION
// raw
'raw ' + raw.version

// vanilla
a.map(() => a.map(d => d.age))
// lodash
a.map(() => _.map(a, 'age'))
// sugar
a.map(() => Sugar.Array.map(a, 'age'))
// raw
// a.map(() => Array.map(a, 'age'))
raw()
a.map(() => a.map('age'))
