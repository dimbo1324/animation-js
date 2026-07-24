# 2026-07-24 — model layer, generic scene, adaptive locked tile

- **Assistant:** Claude Opus 4.8 (Claude Code)
- **Branch:** `feat/model-layer-and-adaptive-tile`
- **Owner request:** Figures must stop being re-rendered by tile resizes:
  the tile is resizable only while nothing is animating, and the figures
  adapt to whatever size the tile has when they start. Use a
  subscriber/notification (Observer) mechanism for sizes. Keep the maximum
  size rule, make the minimum flexible and adaptive to the figure. Build
  `src/models/` so a whole figure — JS and CSS — is authored there and
  handed upward as a class object that can be scaled and driven uniformly.
  Move the existing figures there. One shared scene for all models. Delete
  the `.gitkeep` files that are no longer needed.

## What was done

**Engine (`src/core/`)**

- `Observable.js` — an explicit subscribe/notify channel with value
  dedupe, immediate delivery to late subscribers, and safe removal during
  notification. Plus `sameViewport`, which rounds to whole pixels so
  sub-pixel `ResizeObserver` jitter does not rebuild scene geometry.
- `Mountable.js` — what `Scene` and `Model` share: a root element, the
  current viewport, `onMount`/`onUpdate`/`onRender`/`onResize`/`onDestroy`,
  `listen`, `watch`, `addDisposer`. It subscribes to the viewport channel
  on mount and releases it on destroy, so neither subclass wires resize by
  hand any more.
- `Model.js` — the figure contract. `naturalSize` is the box a figure is
  drawn for; `fit` is the automatic contain-factor into the current
  viewport, clamped by `fitRange`; `renderScale` is `fit * scale` and is
  what every length in a model's render pass is multiplied by. Exported
  `minStageFor()` derives the smallest acceptable stage from a class _or_
  from a manifest entry — the shell needs that number before the class has
  been downloaded.
- `ModelHost.js` — mounts one model into a container, gives it the
  viewport channel, forwards frames and pointer input, tears it down.
- `lazyRegistry.js` — `createLazyRegistry({ kind, describe })`. Both the
  scene and model registries are instances of it. It validates that a
  loaded class's `static id` matches the manifest, and fails loudly on
  unknown or duplicate ids.
- `SceneHost.js` — now owns the _only_ measurement of the stage. One
  `ResizeObserver`, measured through `measureThenMutate`, published on
  `host.viewport`. Added `dispose()`.

**Models (`src/models/`)**

- `src/scenes/creatures/` moved wholesale (`git mv`, history preserved) to
  `src/models/creatures/`, `scene.css` → `model.css`, CSS block renamed
  `scene-creatures__*` → `model-creatures__*`, root selector
  `.scene--creatures` → `.model--creatures`.
- `CreaturesModel extends Model`. Speed, hop distance, hop height, edge
  padding, and per-creature scale are all multiplied by `renderScale`,
  cached once per resize in `#scale`. It no longer calls
  `getBoundingClientRect()` — the pointer arrives already converted to
  stage pixels.
- `creatures/manifest.js` — the data sheet: id, title, `naturalSize`
  560×320, `fitRange` 0.5–1.35, and the dynamic import. The class reads its
  statics back from it, so the numbers have one home.
- `registry.js`, `index.js` (manifest list + `DEMO_MODEL_ID`),
  `models.css` (one `@import` per model plus the shared `.model` frame).
- `_template/` — copy-me model: `index.js`, `manifest.js`, `model.css`.

**Scene (`src/scenes/`)**

- `showcase/index.js` — the one generic scene. Hosts a model through
  `ModelHost`, forwards `onUpdate`/`onRender`, and converts pointer events
  from client to stage coordinates using the already-measured viewport, so
  input costs no layout read. The model class is handed in through
  `options.model`; `Scene` gained an `options` bag that is deliberately
  _not_ reactive, because a class must never end up behind a proxy.
- `scenes/index.js` registers only `showcase`. `scenes.css` no longer
  imports creatures.

**Shell (`src/shell/`)**

- `sizing.js` (new) — the single owner of the tile's size. Watches the
  available space with a `ResizeObserver` on the tile's parent instead of a
  `window` resize listener, caches limits, and refuses every user-initiated
  resize while `sizeLocked` is true.
- `geometry.js` — `measureFrame` + `resolveLimits`. The maximum is
  unchanged (0.95 of bounds). The minimum is now
  `max(model stage, floor) + measured chrome`, capped by the maximum.
- `state.js` — added `stageMin` and `sizeLocked` (a `computed` over
  `sceneVisible`), and `setStageMin()`.
- `ResizeHandles.js` / `SizeMenu.js` take the sizing controller instead of
  the tile element. The size presets are now the two ends of the resolved
  range rather than fixed ratios. While locked, the handles are removed
  from the page by `.tile--locked` and the dropdown trigger is `disabled`
  with an explanatory `title`.

**Elsewhere**

- `main.js` reads the model descriptor, calls `setStageMin` _before_
  anything mounts, then loads scene and model in parallel and mounts.
- ESLint per-frame restrictions now cover `src/models/**`.
- CI guardrails extended: models must not import shell or scenes.
- Removed `.gitkeep` from `docs/`, `public/`, `src/assets/`,
  `src/assets/icons/`, `src/models/`, `src/styles/`, `src/utils/`. Kept in
  the still-empty `config/`, `src/assets/fonts/`, `src/assets/images/`,
  `tests/`, `tests/unit/`, `tests/integration/`.

## Decisions taken

Recorded as D-014 … D-018 in `DECISIONS.md`. The load-bearing ones: the
model is the unit of authorship and the scene is a reusable surface; a
model's metadata lives in a statically-imported manifest so the shell can
size the tile before the model's code exists; measurement travels on an
explicit `Observable` rather than through the reactive proxy layer; and the
tile is locked while a scene runs.

## Files touched

- **Created:** `src/core/{Observable,Mountable,Model,ModelHost,lazyRegistry}.js`,
  `src/shell/sizing.js`, `src/scenes/showcase/index.js`,
  `src/models/{index,registry,models.css}`,
  `src/models/creatures/manifest.js`,
  `src/models/_template/{index.js,manifest.js,model.css}`
- **Moved:** `src/scenes/creatures/*` → `src/models/creatures/*`
  (`scene.css` → `model.css`)
- **Modified:** `src/core/{Scene,SceneHost,registry,index}.js`,
  `src/main.js`, `src/scenes/{index.js,scenes.css}`,
  `src/shell/{Tile,Toolbar,ResizeHandles,SizeMenu,geometry,state,index,shell.css}`,
  `src/styles/main.css`, `eslint.config.js`,
  `.github/workflows/quality.yml`
- **Deleted:** seven `.gitkeep` files

## Verification

- `npm ci` — clean, 0 vulnerabilities. `node_modules/` was absent at the
  start of the session.
- `npm run validate` — prettier, eslint, stylelint, `ai:check` all green.
- **Headless harness, 63 checks, all passing.** Written in the session
  scratchpad (not committed — tests are opt-in). It stubs the DOM and pumps
  `requestAnimationFrame` by hand, then exercises: `Observable` semantics
  including removal during notification; registry duplicate/unknown/id-
  mismatch failures and load-once; `minStageFor` derivation and override;
  `resolveLimits` for the floor case, the demanding-model case, and the
  minimum-capped-by-maximum case; the sizing controller's lock, presets,
  and "shrinking page re-clamps even while locked"; and a full
  `SceneHost.mount(ShowcaseScene, { model: CreaturesModel })` →
  120 pumped frames → `unmount` → remount cycle, asserting that the SVG
  transform changes between frames, that a body path is written, that
  pointer input reaches the model, and that the listener ledger returns to
  its starting count after teardown.
- Browser (`npm run dev`, `http://localhost:5173`): page loads with an
  **empty console**, the toolbar and empty state build, the model registry
  answers in the real browser, and `shellState.stageMin` shows 280×160 —
  the number that came from `creatures/manifest.js` through
  `minStageFor`.
- **NOT verified by eye: continuous motion, dragging, theme switching.**
  The Browser pane in this session is hidden (`document.hidden === true`),
  which suspends `requestAnimationFrame`, so nothing composites and no
  screenshot can be taken. Exactly the limitation the 2026-07-23 session
  hit. The owner should run `npm run dev` and watch it.

## Dead ends

- **Measuring the tile synchronously in `activate()` is wrong.** The first
  implementation kept the old `activate()` → `measureBounds()` → set the
  0.7 start size. It produced a tile pinned to its maximum. Instrumenting
  `setSize` showed the first measurement happening before layout had
  settled: `body.offsetWidth` was 0, so measured "chrome" came out as the
  whole tile, `min` was computed above `max`, and the cap collapsed the
  range to a single size. Two fixes, both kept: `measureChrome` returns
  zero when the body has no box yet rather than inventing a number, and
  the first sizing happens in the `ResizeObserver`'s first callback, which
  fires after layout.
- **`Model.minStage` cannot be a static getter that delegates to
  `minStageFor(this)`** — the helper checks `descriptor.minStage`, which
  re-enters the getter and recurses forever. It is a plain optional static
  field, and the derivation lives only in the free function.
- Naming: `Registry.js` next to `registry.js` was rejected outright — on a
  case-insensitive filesystem (this repo lives on Windows) those are the
  same file. Hence `lazyRegistry.js`.

## Open threads / handoff

1. **A model picker is now the obvious next step.** `listModels()` returns
   full descriptors and nothing consumes it; the toolbar still summons
   `DEMO_MODEL_ID` and nothing else. When it is built, it must set
   `stageMin` from the chosen descriptor _before_ mounting — that ordering
   is what makes the tile adapt.
2. **`Model.scale` has no UI.** The contract and the plumbing are there
   (`ModelHost.mount(Class, { scale })`, `model.scale = 1.4`), but nothing
   in the shell exposes it. A zoom control in the toolbar would be a small
   piece of work and the owner asked for scale to be a first-class action.
3. Shell copy still says "существ" (`tile__empty-hint`, the scene toggle's
   `aria-label`). That is creature-specific wording in a layer that is
   otherwise model-agnostic. Left alone deliberately — changing it was not
   asked for.
4. The creatures now scale with the tile. On a large tile they render up to
   1.35×, on a small one down to 0.5×. If the owner dislikes the zoom, the
   single knob is `fitRange` in `creatures/manifest.js`; setting
   `{ min: 1, max: 1 }` restores the old fixed-size behaviour.
5. `src/scenes/_template/` is still a Scene template and is still correct,
   but with one generic scene most new work is a _model_, so
   `src/models/_template/` is the one to copy.
