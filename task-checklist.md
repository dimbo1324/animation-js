# Task: model layer, generic scene, and an adaptive locked tile

Owner request, 2026-07-24. Branch `feat/model-layer-and-adaptive-tile`.

Legend: `+` done, `-` not done or partial.

## Preparation

- [+] Orientation ritual: git status/log, `PROJECT_STATE.md`,
  `DECISIONS.md`, newest session files, previous checklist
- [+] Read the engine, the shell, and the creatures scene end to end
- [+] Leave `docs/__arch__/` untouched

## Task 1 — engine: the model contract

- [+] `src/core/Observable.js` — explicit subscribe/notify channel
- [+] `src/core/Mountable.js` — shared root/viewport/lifecycle/teardown
- [+] `src/core/Model.js` — the contract every figure implements
- [+] `src/core/ModelHost.js` — mounts one model into a container
- [+] `src/core/lazyRegistry.js` — generic lazy id → loader registry
- [+] `src/core/registry.js` rebuilt on the factory, same public API
  (`getScene` added)
- [+] `Scene` and `SceneHost` moved onto the viewport observable
- [+] `src/core/index.js` re-exports the new surface

## Task 2 — the models layer

- [+] `src/models/registry.js`, `src/models/index.js`, `models.css`
- [+] `src/models/_template/` — copy-me model (js + css + manifest)
- [+] `src/scenes/creatures/` moved to `src/models/creatures/` with
  `git mv`, so file history is preserved
- [+] Creatures reworked as a `Model`: fit scale, stage-local pointer, no
  `getBoundingClientRect()` of its own
- [+] `src/styles/main.css` imports the models stylesheet

## Task 3 — one generic scene

- [+] `src/scenes/showcase/` — hosts any model, forwards frames and input
- [+] `src/scenes/index.js` registers the showcase; creatures deregistered
- [+] `src/main.js` wires model → tile minimum → scene mount

## Task 4 — the tile: locked while animating, adaptive minimum

- [+] `shellState.stageMin` and the `sizeLocked` derivation
- [+] `src/shell/sizing.js` — one owner of measurement and clamping
- [+] Adaptive minimum from the model's declared stage; maximum unchanged
- [+] Resize handles and the size menu refuse to act while a scene runs
- [+] Tile grows to fit a model that needs more room

## Task 5 — repository hygiene

- [+] Removed `.gitkeep` from `docs/`, `public/`, `src/assets/`,
  `src/assets/icons/`, `src/models/`, `src/styles/`, `src/utils/`;
  kept in the six directories that are still genuinely empty
- [+] ESLint: per-frame restrictions extended to `src/models/**`
- [+] CI guardrails: models must not import shell or scenes

## Verification

- [+] `npm ci` — clean, 0 vulnerabilities (`node_modules/` was absent)
- [+] `npm run validate` — prettier, eslint, stylelint, `ai:check` green
- [+] Headless harness in the scratchpad: 63 checks, all passing —
  `Observable`, both registries, `minStageFor`, `resolveLimits`, the
  sizing lock, and a full mount → 120 frames → unmount → remount cycle
  with the real creatures model
- [+] Page loads with a clean console; the model registry answers in the
  browser and `stageMin` arrives from the manifest
- [-] Motion NOT watched by a human. The Browser pane in this session is
  hidden (`document.hidden === true`), which suspends
  `requestAnimationFrame`, so nothing composites and no screenshot can
  be taken. Same limitation as the 2026-07-23 session. Owner should run
  `npm run dev`.
- [-] Dragging the handles, the size dropdown, and theme switching NOT
  exercised interactively, for the same reason. Their logic is covered
  by the headless harness and by review.

## Completion

- [+] `.ai/memory/PROJECT_STATE.md` rewritten for the new shape
- [+] `.ai/memory/DECISIONS.md` appended with D-014 … D-018
- [+] Session artifact written
- [+] Rule modules updated (`10-project-map`, `13-reactivity-doctrine`,
  `15-guardrails`) and `npm run ai:sync` run
- [+] Checklist filled with `+`/`-`
- [+] Final report
