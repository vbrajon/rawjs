#!/usr/bin/env node

// USAGE: echo "1 2 3" | x ".split(/ +/).map(d => +d).sum()"
require('./xtend')()
process.stdin.on('readable', () => {
  let chunk
  while (null !== (chunk = process.stdin.read())) {
    let x = ('' + chunk).slice(0, -1)
    console.log(eval('x' + (process.argv[2] || '')))
  }
})
