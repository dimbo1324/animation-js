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
src/main.js         Entry point. Wires shell + engine + scene. <50 lines.
src/core/           The engine. Scene-agnostic, no DOM chrome.
src/shell/          The frame: tile, toolbar, theme, resize.
src/scenes/         One folder per animation. Self-contained.
src/styles/         Tokens, base layer, and the `main.css` import root.
src/utils/          Small pure helpers (math, easing, icons).
scripts/            Tooling: dev server, rule sync, hook install.
.ai/                Assistant rule modules and cross-session memory.
.claude/ .codex/    Per-assistant workspaces, kept as mirrors.
.githooks/          Local git hooks, including `main` protection.
docs/__arch__/      OWNER-PRIVATE. See the guardrails module.
```

## The shell / scene separation

The architectural spine, and the reason the project exists.

- **Shell** is the container: the card, its chrome, its theme, its resize
  behaviour. Written once, rarely changed. Never imports from
  `src/scenes/`.
- **Scene** is one animation: characters, motion, its own CSS, its own
  state. It receives a root element and owns everything inside it. Never
  reaches outside that root; never imports from `src/shell/`.
- **Core** is the bridge and the machinery both stand on: ticker,
  reactive state, DOM batching, the `Scene` base class, the registry.
  Imports from neither.

Import direction is one-way, enforced by review and by CI:

```text
main.js -> shell, core, scenes
shell   -> core, utils
scenes  -> core, utils
core    -> utils
utils   -> (nothing)
```

Adding an animation must never require editing shell code. If it does,
the seam is wrong — fix the seam.

## Adding a scene

Copy `src/scenes/_template/` to `src/scenes/<scene-id>/`, extend `Scene`
in `index.js`, style it in `scene.css` scoped under the scene root class,
then register it in `src/scenes/index.js` and add the one-line `@import`
in `src/scenes/scenes.css`. Nothing else changes.
