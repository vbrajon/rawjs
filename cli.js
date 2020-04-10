#!/usr/bin/env node

if (process.stdin.isTTY) {
  console.log(`USAGE: [cmd] | raw <raw-javascript>

EXEMPLE:

    echo 1+2+3+4+5 | raw -e

    curl -s https://api.github.com/users/vbrajon | raw .length

    curl -s https://api.github.com/users/vbrajon/repos | raw ".group(v => v.pushed_at.slice(0, 4)).map('length')"

INTERACTIVE:

    curl -s https://api.github.com/users/vbrajon | raw
    > .login
    vbrajon
    > .access(['followers', 'following']).sum()
    100
    > = x.name
    Valentin Brajon
    > .length
    15

WEBSITE: https://vbrajon.github.io/rawjs

GITHUB: https://github.com/vbrajon/rawjs
`)
  process.exit(0)
}

run()
async function run() {
  require('./raw.js')
  Object.extend(true)
  const readline = require('readline')

  let x, stdin = process.stdin, stdout = process.stdout
  const lines = []
  for await (const line of readline.createInterface(process.stdin)) lines.push(line)
  x = lines.join('\n')
  try { x = eval(x) } catch(e) {}
  try { x = JSON.parse(x) } catch(e) {}
  try { x = eval('x' + process.argv.slice(2).join('')) } catch(e) {}
  console.log(x)
  if (process.argv.length > 2) process.exit(0)
  stdin = new (require('tty')).ReadStream(require('fs').openSync('/dev/tty', 'r'))

  stdout.write('> ')
  for await (const line of readline.createInterface(stdin, stdout)) {
    try { console.log(eval('x' + line)) } catch(e) { console.error('\x1b[31m%s\x1b[0m', e.message) }
    stdout.write('> ')
  }
}
