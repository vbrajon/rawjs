#!/usr/bin/env node

// USAGE: echo '{"range":[1, 2]}' | x '.range.sum()'
require('./xtend')()
let x = ''
const stdin = process.stdin
const stdout = process.stdout
stdin.setEncoding('utf8')
stdin.on('data', chunk => x += chunk)
stdin.on('end', () => {
  try { x = JSON.parse(x) } catch(e) { x = '`' + x + '`' }
  if (process.argv.length <= 2) return console.log(x)
  let expr = 'x' + process.argv.slice(2).join('')
  return console.log(eval(expr))
})
