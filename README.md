[rawjs](https://github.com/vbrajon/rawjs) is a utility library to ease **data & dates manipulation**, **formatting & internationalisation** and **function composition**.  
It is a simpler version of [lodash](https://github.com/lodash/lodash) and [moment](https://github.com/moment/moment/).

Installation:
- in browser: `<script src="https://vbrajon.github.io/rawjs/raw.js"></script>`
- in node: `npm i git+https://git@github.com/vbrajon/rawjs.git` then `import 'rawjs'` or `require('rawjs')`
- in cli: `npm i -g git+https://git@github.com/vbrajon/rawjs.git` then ``

It brings:
- **functions**: <code><span class="token known-class-name class-name">Object</span><span class="token punctuation">.</span><span class="token property-access">map</span></code>, <code><span class="token known-class-name class-name">Array</span><span class="token punctuation">.</span><span class="token property-access">group</span></code>, <code><span class="token known-class-name class-name">Function</span><span class="token punctuation">.</span><span class="token property-access">throttle</span></code>, <code><span class="token known-class-name class-name">Date</span><span class="token punctuation">.</span><span class="token property-access">plus</span></code> and 50 more
- **shortcuts**: <code><span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">.</span><span class="token method function property-access">find</span><span class="token punctuation">(</span><span class="token regex">/Jo/</span><span class="token punctuation">)</span></code>
 equals <code><span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">.</span><span class="token method function property-access">find</span><span class="token punctuation">(</span><span class="token parameter">v</span> <span class="token arrow operator">=&gt;</span> <span class="token regex">/Jo/</span><span class="token punctuation">.</span><span class="token method function property-access">test</span><span class="token punctuation">(</span>v<span class="token punctuation">)</span><span class="token punctuation">)</span></code>
- **chaining**: <code><span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">.</span><span class="token method function property-access">map</span><span class="token punctuation">(</span><span class="token string">'name.length'</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token method function property-access">filter</span><span class="token punctuation">(</span><span class="token parameter">v</span> <span class="token arrow operator">=&gt;</span> v <span class="token operator">&gt;</span> <span class="token number">5</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token method function property-access">sum</span><span class="token punctuation">(</span><span class="token punctuation">)</span></code>
- **immutability**: including <code><span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">.</span><span class="token method function property-access">sort</span><span class="token punctuation">(</span><span class="token punctuation">)</span></code> and <code><span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">.</span><span class="token method function property-access">reverse</span><span class="token punctuation">(</span><span class="token punctuation">)</span></code>

It is:
- **easy to learn**: \~50 functions / no dependencies / [\~250 lines codebase](https://github.com/vbrajon/rawjs/blob/master/raw.js)
- **lightweight**: [\~4k gzipped](raw.js)
- **extensible**: <code><span class="token known-class-name class-name">Array</span><span class="token punctuation">.</span><span class="token method-variable function-variable method function property-access">first</span> <span class="token operator">=</span> <span class="token parameter">arr</span> <span class="token arrow operator">=&gt;</span> arr<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span></code> + <code><span class="token known-class-name class-name">Object</span><span class="token punctuation">.</span><span class="token method function property-access">extend</span><span class="token punctuation">(</span><span class="token boolean">true</span><span class="token punctuation">)</span></code> = <code><span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">.</span><span class="token method function property-access">first</span><span class="token punctuation">(</span><span class="token punctuation">)</span></code>

<!-- Additionally, rawjs brings an interactive commandline.
```sh
npm i -g git+https://git@github.com/vbrajon/rawjs.git
raw --help
curl -s https://api.github.com/users/torvalds | raw ".access(['followers', 'following']).sum()"
``` -->

<!-- It works in:
- evergreen browsers: chrome / firefox / safari
- old browsers: IE6 with [this build]()
- node
- the commandline -->
