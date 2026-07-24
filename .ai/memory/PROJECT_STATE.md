# Project State

Last updated: 2026-07-24

## What this is

A zero-dependency playground for building complex animations, cartoon
characters, and animated graphical processes in vanilla JavaScript, CSS,
and HTML. No framework, no bundler, no runtime library. Personal craft
project; the bar is excellent frontend engineering, not shipping.

## Current shape

```text
public/index.html   One page. Exactly one CSS link and one module script.
src/main.js         Entry point. Shell + host + model + scene. ~50 lines.
src/core/           The engine (see below).
src/shell/          The tile: toolbar, theme, sizing, resize handles.
src/scenes/         The surfaces animations run on. One generic scene.
src/models/         One folder per figure. The unit of authorship.
src/styles/         tokens.css, base.css, main.css (the import root).
src/utils/          math.js, easing.js, icons.js, Spring.js, noise.js.
scripts/            dev-server.mjs, ai/, setup/.
```

### Engine (`src/core/`)

| Module            | Owns                                                     |
| ----------------- | -------------------------------------------------------- |
| `scheduler.js`    | One frame queue with effect → read → write phases        |
| `reactive.js`     | `reactive` / `effect` / `computed` over `Proxy`          |
| `Observable.js`   | Subscribe/notify channel; the viewport rides it          |
| `Ticker.js`       | The single rAF loop; `dt`, clamping, fixed step, `fps`   |
| `dom.js`          | `read` / `write` batching, `transform`, `element`        |
| `Mountable.js`    | Root + viewport + lifecycle + teardown, shared base      |
| `Scene.js`        | A surface. Extends `Mountable`; adds state and options   |
| `SceneHost.js`    | Mounts one scene; owns the only measurement of the stage |
| `Model.js`        | A figure. Extends `Mountable`; adds scale and fit        |
| `ModelHost.js`    | Mounts one model into a container; forwards input        |
| `lazyRegistry.js` | `createLazyRegistry` — id → descriptor + lazy loader     |
| `registry.js`     | The scene registry, built on that factory                |
| `index.js`        | The public surface. Import from here, not the files.     |

### Layering

```text
main.js  →  shell, core, scenes, models
shell    →  core, utils
scenes   →  core, models, utils
models   →  core, utils
core     →  utils
```

`shell` imports neither `scenes` nor `models`, and `models` never imports
`scenes` or `shell`. CI enforces all of it.

### Scenes vs models — the distinction that matters

A **scene** is the surface: the ground, the backdrop, the input surface,
the camera. A **model** is the figure standing on it: body, rig, motion,
its own CSS. Adding an animation means adding a _model_; scenes are added
only when a surface needs behaviour of its own.

There is currently one scene, `src/scenes/showcase/`. It hosts one model
through `ModelHost`, forwards `onUpdate`/`onRender`, and converts pointer
events into stage pixels before handing them on. The model class reaches it
through `options.model`, handed in by `main.js` — `Scene.options` is a
plain bag, deliberately not reactive, because a class must never end up
behind a proxy.

`src/scenes/_template/` is still a valid Scene starting point, but most new
work is a model.

### Models (`src/models/`)

- `creatures/` — the reference model. Three soft-bodied characters running
  single file. Procedural throughout: a rounded polygon is sampled into 56
  points, deformed every frame by breathing, weight and noise, then
  smoothed back into an SVG path. Springs drive every facial value; eyes
  track the pointer, blink, and go cross-eyed. Split into `Creature.js`
  (simulation), `CreatureView.js` (SVG writes), `Trail.js` (the leader's
  path history), `geometry.js`, `species.js`, `moods.js`, `manifest.js`.
- `_template/` — copy-me starting point. Deliberately not registered and
  not imported by `models.css`.

**The model root class is `.model--<id>`** — that is what `ModelHost` puts
on the element. Model CSS targets that; anything the model builds itself
uses its own `model-<id>__*` block. (`.scene--<id>` is the equivalent for
scenes.)

Each model folder carries a `manifest.js`: `id`, `title`, `naturalSize`,
optional `fitRange` and `minStage`, and the dynamic `load()`. It is
imported statically by `src/models/index.js`, so the application knows a
figure's title and size appetite before downloading its code — that is what
lets the shell size the tile around a figure that has not loaded yet. The
class imports the same manifest back for its statics.

**Registration points when adding a model:** `src/models/index.js` (import
the manifest, add it to `MANIFESTS`) and `src/models/models.css` (one
`@import`). Nothing else.

### Sizing: who decides how big things are

Two numbers, pulling in opposite directions, and both are honoured.

- **The figure adapts to the tile.** `Model.naturalSize` is the box a
  figure is drawn for. `Model.fit` is the automatic contain-factor into the
  current viewport, clamped by `fitRange`. `Model.renderScale` is
  `fit * scale`, and every length a model draws is multiplied by it.
- **The tile adapts to the figure.** `minStageFor(descriptor)` derives the
  smallest stage a figure will accept. `main.js` writes it to
  `shellState.stageMin` _before_ mounting anything, and the shell's minimum
  size becomes `max(model stage, floor) + measured chrome`, capped by the
  maximum. The maximum is unchanged: 0.95 of the available bounds.

**The tile cannot be resized while a scene is running.** `sizeLocked` is a
`computed` over `shellState.sceneVisible`; while it is true the drag
handles are removed by `.tile--locked`, the size dropdown is `disabled`,
and `src/shell/sizing.js` refuses programmatically as well. A shrinking
page still re-clamps the tile — the lock is about the user resizing.

`src/shell/sizing.js` is the single owner of the tile's size: it watches
the tile's parent with a `ResizeObserver` (not a `window` listener), caches
the limits, and takes the starting size in the observer's first callback,
which is the first moment layout is real. Measuring earlier reads a page
whose stylesheets have not settled and silently pins the tile to its
maximum — see D-018.

### The viewport channel

`SceneHost` owns the only `ResizeObserver` on the stage. It measures
through `measureThenMutate` and publishes `{ width, height, left, top }` on
`host.viewport`, an `Observable`. `Scene` and every `Model` subscribe
through `Mountable` and release on destroy, so `onResize` arrives without
either of them wiring anything. Nothing else calls
`getBoundingClientRect()` on the stage, and pointer conversion is free
because the offset is already known.

### Shell

The tile is reactive: `src/shell/state.js` holds `theme`, `width`,
`height`, `sceneVisible`, `sceneTitle`, and `stageMin`; widgets mutate that
state and effects project it onto the DOM. Bounds are measured once per
interaction, never per pointer move.

The toolbar is a real header strip across the top of the tile — its own
surface, with the scene label on the left and the controls on the right —
so nothing floats over the artwork. The tile is deliberately not
`overflow: hidden`, or the size dropdown could not escape the card.

The two size presets are the ends of the resolved range: "Максимум" is the
0.95 bound, "Минимум" is whatever the model needs.

**Dark is the default theme.** `data-theme` lives on `<html>`, pre-set in
`public/index.html` so the first paint is already correct, and owned by the
shell from then on. All palettes are `:root[data-theme=…]` in `tokens.css`.

Icons are Lucide only, inlined in `src/utils/icons.js` with reference
copies in `src/assets/icons/`. No Unicode symbols anywhere in the UI.

Nothing is mounted on load. `shellState.sceneVisible` is the flag; the
toolbar flips it and `main.js` reacts by mounting `DEMO_SCENE_ID` with
`DEMO_MODEL_ID`. That is how the shell stays ignorant of both directories.

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

- No model picker in the UI. `listModels()` returns full descriptors and
  nothing consumes it; the toolbar summons `DEMO_MODEL_ID` and nothing
  else. This is the natural next step, and it must write `stageMin` from
  the chosen descriptor _before_ mounting.
- No UI for `Model.scale`. The contract and the plumbing exist
  (`ModelHost.mount(Class, { scale })`); nothing exposes it yet.
- No tests and no test runner. Opt-in by owner request only.
- No build step and no `dist/`. Not needed; do not add one unasked.
- No Canvas or WebGL tier. The DOM tier has not been outgrown.
