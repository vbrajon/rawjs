[cut](https://github.com/vbrajon/cut) is a shortcut utility library to speed up **data transformation**, **dates manipulation**, **formatting** and **function composition**.  
It is a simpler version of [lodash](https://github.com/lodash/lodash) or [moment](https://github.com/moment/moment/).

## Usage

```js
const { default: cut } = await import("https://raw.githack.com/vbrajon/rawjs/cut/cut.js")
cut.Array.group(["a", "bc", "d"], "length")
```

## Development

```bash
bun run cutest.test.js # OR deno run -A cutest.test.js
```

## Roadmap

- [ ] Docs in README: https://github.com/vbrajon/rawjs/tree/cut
- [ ] Docs interactive: https://raw.githack.com/vbrajon/rawjs/cut/index.html
- [ ] Test Viewer/Editor: https://raw.githack.com/vbrajon/rawjs/cut/cutest.html
