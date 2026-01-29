---
title: svg
---

<div class="lib-links">
[Library directory](https://github.com/graphology/graphology/tree/master/src/svg)
</div>

# Graphology SVG

SVG rendering routines for [`graphology`](/).

## Installation

```
npm install graphology-svg
```

## Usage

```js
var render = require('graphology-svg');

render(graph, './graph.svg', () => console.log('Done!'));
render(graph, './graph.svg', settings, () => console.log('Done!'));
```

