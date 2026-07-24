# Project: animation-js

A zero-dependency playground for building complex animations, cartoon
characters, and animated graphical processes with nothing but vanilla
JavaScript, CSS, and HTML. No framework, no bundler, no runtime library.

A personal craft project, not a product. The bar is not "shipped", it is
**excellent frontend engineering**: clean decomposition, real
architecture, and motion that holds a stable frame budget.

## The one hard structural rule

`public/index.html` links **exactly two** assets and never more:
`src/styles/main.css` and `src/main.js`. Everything else is reached from
inside those two — CSS through `@import`, JavaScript through ES module
`import`. A third reference in the HTML is a rule violation.

## Repository map

```text
public/index.html   Single page. Two asset references.
src/main.js         Entry point. Wires shell + engine + scene + model.
src/core/           The engine. Scene-agnostic, no DOM chrome.
src/shell/          The frame: tile, toolbar, theme, sizing.
src/scenes/         The surfaces animations run on. One generic scene.
src/models/         One folder per figure. Where animations are written.
src/styles/         Tokens, base layer, and the `main.css` import root.
src/utils/          Small pure helpers (math, easing, icons).
scripts/            Tooling: dev server, rule sync, hook install.
.ai/                Assistant rule modules and cross-session memory.
.claude/ .codex/    Per-assistant workspaces, kept as mirrors.
.githooks/          Local git hooks, including `main` protection.
docs/__arch__/      OWNER-PRIVATE. See the guardrails module.
```

## The shell / scene / model separation

The architectural spine, and the reason the project exists.

- **Shell** is the container: the card, its chrome, its theme, its sizing
  behaviour. Written once, rarely changed. Never imports from
  `src/scenes/` or `src/models/`.
- **Scene** is the surface an animation runs on: ground, backdrop, input,
  camera. It receives a root element and owns everything inside it. Never
  reaches outside that root; never imports from `src/shell/`.
- **Model** is one figure: body, rig, motion, its own CSS, its own state.
  It owns a root element handed to it by a `ModelHost` and knows nothing
  about which scene is hosting it or what the page looks like.
- **Core** is the machinery all three stand on: ticker, reactive state,
  the viewport `Observable`, DOM batching, the `Scene` and `Model` base
  classes, the registries. Imports from none of them.

Import direction is one-way, enforced by review and by CI:

```text
main.js -> shell, core, scenes, models
shell   -> core, utils
scenes  -> core, models, utils
models  -> core, utils
core    -> utils
utils   -> (nothing)
```

Adding an animation must never require editing shell code, and adding a
figure must never require editing a scene. If it does, the seam is wrong —
fix the seam.

## Adding a model — the default task

Copy `src/models/_template/` to `src/models/<model-id>/`. Fill in
`manifest.js` (id, title, `naturalSize`, `fitRange`), extend `Model` in
`index.js`, style it in `model.css` under `.model--<model-id>`. Then
register it in exactly two places: import the manifest into `MANIFESTS` in
`src/models/index.js`, and add one `@import` to `src/models/models.css`.

Multiply every length in the frame path by `this.renderScale` — that is
what makes a figure fit whatever stage it is given. Cache it in `onResize`
rather than reading it three times a frame.

## Adding a scene — rarely

There is one generic scene, `src/scenes/showcase/`, and it hosts any
model. Add a scene only when a _surface_ needs behaviour of its own.
Copy `src/scenes/_template/`, extend `Scene`, register it in
`src/scenes/index.js`, and add its `@import` to `src/scenes/scenes.css`
if it has styles of its own.
