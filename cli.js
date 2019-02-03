#!/usr/bin/env node

// USAGE: echo 1 2 3 | x ".split(/ +/).map(d => +d).sum()"
require('./xtend')()
if (process.argv.length <= 2) return process.stdin.pipe(process.stdout)
let x = ''
const stdin = process.stdin
const stdout = process.stdout
stdin.setEncoding('utf8')
stdin.on('data', chunk => x += chunk)
stdin.on('end', () => {
  x = x.slice(0, -1)
  try { x = JSON.parse(x) } catch(e) { x = '`' + x + '`' }
  let expr = 'x' + process.argv.slice(2).join('')
  console.log(eval(expr))
})
