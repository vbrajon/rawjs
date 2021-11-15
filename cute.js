#!/usr/bin/env node

import './cut.js'
import readline from 'readline'
import tty from 'tty'
import fs from 'fs'

const help = `USAGE: [cmd] | cute <javascript>

EXEMPLE:

    cute 1+2+3+4+5

    curl -s https://api.github.com/users/vbrajon | cute .length

    curl -s https://api.github.com/users/vbrajon/repos | cute ".group(v => v.pushed_at.slice(0, 4)).map('length')"

INTERACTIVE:

    curl -s https://api.github.com/users/vbrajon | cute
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
`

if (process.stdin.isTTY) {
  console.log(help)
  // if (fs.existsSync(process.argv[2])) process.stdin = fs.createReadStream(process.argv[2])
  // console.log()
  // console.log(eval(process.argv[2]))
  process.exit(0)
}

run()
async function run() {
  let v
  let stdin = process.stdin
  const stdout = process.stdout
  const lines = []
  for await (const line of readline.createInterface(process.stdin)) lines.push(line)
  v = lines.join('\n')
  try {
    v = eval(v)
  } catch (e) {}
  try {
    v = JSON.parse(v)
  } catch (e) {}

  if (process.argv.length > 2) {
    process.argv.slice(2).map(arg => {
      try {
        if (arg.startsWith('.')) arg = 'v' + arg
        return (v = eval(arg))
      } catch (e) {
        console.error(`\x1b[31m${e.name}:\x1b[0m ${e.message}`)
        process.exit(1)
      }
    })
    console.log(v)
    process.exit(0)
  }

  stdin = new tty.ReadStream(fs.openSync('/dev/tty', 'r'))
  const completer = line => {
    let completions = Object.keys(v.constructor)
      .filter(fn => v[fn])
      .map(fn => `.${fn}(`) // v.constructor[fn].split('=>')[0]
    if (v instanceof Array) completions = completions.concat(Object.keys(v).map(k => `[${k}]`))
    else if (v instanceof Object) completions = completions.concat(Object.keys(v).map(k => `.${k}`))
    const hits = completions.filter(c => c.startsWith(line))
    return [(hits.length ? hits : completions).slice(0, 50), line]
  }
  console.log(v)
  stdout.write('> ')
  const rl = readline.createInterface(stdin, stdout, completer)
  rl.on('SIGINT', () => process.exit(0))
  for await (let line of rl) {
    try {
      if (!line) line = 'v'
      if (line.startsWith('.')) line = 'v' + line
      console.log(eval(line))
    } catch (e) {
      console.error(`\x1b[31m${e.name}:\x1b[0m ${e.message}`)
    }
    stdout.write('> ')
  }
}
