#!/usr/bin/env node

if (process.stdin.isTTY) {
  console.log(`USAGE: [cmd] | cut <javascript>

EXEMPLE:

    echo 1+2+3+4+5 | cut -e

    curl -s https://api.github.com/users/vbrajon | cut .length

    curl -s https://api.github.com/users/vbrajon/repos | cut ".group(v => v.pushed_at.slice(0, 4)).map('length')"

INTERACTIVE:

    curl -s https://api.github.com/users/vbrajon | cut
    > .login // autocompletion is on, you can enter ".l" then "tab"
    vbrajon
    > .access(['followers', 'following']).sum()
    100
    > = x.name
    Valentin Brajon
    > .words()
    ['Valentin', 'Brajon']

WEBSITE: https://vbrajon.github.io/cut

GITHUB: https://github.com/vbrajon/cut
`)
  process.exit(0)
}

run()
async function run() {
  await import('./cut.js')
  const readline = await import('readline')
  const tty = await import('tty')
  const fs = await import('fs')

  let x, stdin = process.stdin, stdout = process.stdout
  const lines = []
  for await (const line of readline.createInterface(process.stdin)) lines.push(line)
  x = lines.join('\n')
  try { x = eval(x) } catch(e) {}
  try { x = JSON.parse(x) } catch(e) {}
  try { x = eval('x' + process.argv.slice(2).join('')) } catch(e) {}
  console.log(x)
  if (process.argv.length > 2) process.exit(0)
  stdin = new tty.ReadStream(fs.openSync('/dev/tty', 'r'))

  const completer = line => {
    let completions = Object.keys(x.constructor).filter(fn => x[fn]).map(fn => `.${fn}(`)// x.constructor[fn].split('=>')[0]
    if (x instanceof Array) completions = completions.concat(Object.keys(x).map(k => `[${k}]`))
    else if (x instanceof Object) completions = completions.concat(Object.keys(x).map(k => `.${k}`))
    const hits = completions.filter(c => c.startsWith(line))
    return [(hits.length ? hits : completions).slice(0, 50), line]
  }
  stdout.write('> ')
  const rl = readline.createInterface(stdin, stdout, completer)
  rl.on('SIGINT', () => process.exit(0))
  for await (const line of rl) {
    try { console.log(eval('x' + line)) } catch(e) { console.error('\x1b[31m%s\x1b[0m', e.message) }
    stdout.write('> ')
  }
}
