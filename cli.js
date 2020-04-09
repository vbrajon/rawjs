#!/usr/bin/env node

// USAGE: echo '{"range":[1, 2]}' | raw '.range.sum()'
require('./raw.js')
Object.extend(true)
let x = ''
const stdin = process.stdin
const stdout = process.stdout
stdin.setEncoding('utf8')
stdin.on('data', chunk => x += chunk)
stdin.on('end', () => {
  try { x = eval(x) } catch(e) {}
  try { x = JSON.parse(x) } catch(e) {}
  const expr = 'x' + process.argv.slice(2).join('')
  return process.argv.length <= 2 ? console.log(x) : console.log(eval(expr))
})
