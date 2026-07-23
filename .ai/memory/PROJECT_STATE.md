# Project State

Last updated: 2026-07-23

## What this is

A zero-dependency playground for building complex animations, cartoon
characters, and animated graphical processes in vanilla JavaScript, CSS,
and HTML. No framework, no bundler, no runtime library. Personal craft
project; the bar is excellent frontend engineering, not shipping.

## Current shape

```text
public/index.html   One page. Exactly one CSS link and one module script.
src/main.js         Entry point. Shell + host + default scene. ~30 lines.
src/core/           The engine (see below).
src/shell/          The tile: toolbar, theme, resize handles.
src/scenes/         One folder per animation.
src/styles/         tokens.css, base.css, main.css (the import root).
src/utils/          math.js, easing.js, icons.js.
scripts/            dev-server.mjs, ai/, setup/.
```

### Engine (`src/core/`)

| Module         | Owns                                                      |
| -------------- | --------------------------------------------------------- |
| `scheduler.js` | One frame queue with effect → read → write phases         |
| `reactive.js`  | `reactive` / `effect` / `computed` over `Proxy`           |
| `Ticker.js`    | The single rAF loop; `dt`, clamping, fixed step, `fps`    |
| `dom.js`       | `read` / `write` batching, `transform`, `element` helpers |
| `Scene.js`     | Lifecycle contract every animation extends                |
| `SceneHost.js` | Mounts one scene into a container; resize; teardown       |
| `registry.js`  | id → lazy loader; `listScenes` without importing them     |
| `index.js`     | The public surface. Import from here, not from the files. |

### Layering

```text
main.js  →  shell, core, scenes
shell    →  core, utils
scenes   →  core, utils
core     →  utils
```

`shell` and `scenes` never import each other. CI enforces it.

### Scenes

- `src/scenes/walker/` — reference scene. A character pacing back and
  forth with squash-and-stretch, head lag, opposed limb swing, blinking,
  and a click/Enter pause. Demonstrates every project rule in one file.
- `src/scenes/_template/` — copy-me starting point. Deliberately not
  registered and not imported by `scenes.css`.

Registration points when adding a scene: `src/scenes/index.js` (lazy
loader) and `src/scenes/scenes.css` (one `@import`). Nothing else.

### Shell

The tile is reactive: `src/shell/state.js` holds `theme`, `width`, and
`height`; widgets mutate that state and effects project it onto the DOM.
Bounds are measured once per interaction, never per pointer move.

## Tooling

- `npm run dev` — dependency-free static server with SSE live reload on
  `http://localhost:5173`.
- `npm run validate` — prettier check, eslint, stylelint, rule-sync check.
  This is the gate.
- `npm run ai:sync` — regenerate `AGENTS.md`, `GEMINI.md`,
  `.github/copilot-instructions.md`, `.cursor/rules/animation-js.mdc` from
  `.ai/`.
- Hooks live in `.githooks/` and are installed by `npm install`.
  `reference-transaction` makes deleting local `main` impossible;
  `pre-push` blocks force-push and deletion of remote `main` and runs the
  gate.
- Formatting is deliberately vertical: `printWidth: 72`,
  `singleAttributePerLine`, `trailingComma: all`, operators at line start.

## Not built yet

- No scene picker in the UI. `registry.listScenes()` exists and is unused;
  `main.js` mounts `DEFAULT_SCENE_ID` directly.
- No tests and no test runner. Opt-in by owner request only.
- No build step and no `dist/`. Not needed; do not add one unasked.
- No Canvas or WebGL tier. The DOM tier has not been outgrown.
