[cut](https://github.com/vbrajon/cut) is a shortcut utility library to speed up **data transformation**, **dates manipulation**, **formatting** and **function composition**.  
It is a simpler version of [lodash](https://github.com/lodash/lodash) or [moment](https://github.com/moment/moment/).

## Installation:

- in browser: `<script src="https://vbrajon.github.io/cut/cut.js"></script>`
- in node: `npm i git+https://git@github.com/vbrajon/cut.git` then `import 'cut'` or `require('cut')`
- in cli: `npm i -g git+https://git@github.com/vbrajon/cut.git` then `cute`

## Contribute:

- `git clone https://github.com/vbrajon/rawjs.git -b cut cut;cd cut`
- `deno test --import-map import-map.json --allow-read --allow-net --no-check --watch`
- `deno bench cut-sync.test.js --import-map import-map.json --allow-read --allow-net --no-check --watch --unstable`
- `npx prettier --no-semi --single-quote --arrow-parens=avoid --trailing-comma=all --print-width=160 --write *`
