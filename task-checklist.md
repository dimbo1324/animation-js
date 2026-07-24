# Task: model layer, generic scene, and an adaptive locked tile

Owner request, 2026-07-24. Branch `feat/model-layer-and-adaptive-tile`.

Legend: `+` done, `-` not done or partial.

## Preparation

- [ ] Orientation ritual: git status/log, `PROJECT_STATE.md`,
      `DECISIONS.md`, newest session files, previous checklist
- [ ] Read the engine, the shell, and the creatures scene end to end
- [ ] Leave `docs/__arch__/` untouched

## Task 1 — engine: the model contract

- [ ] `src/core/Observable.js` — explicit subscribe/notify channel
- [ ] `src/core/Mountable.js` — shared root/viewport/lifecycle/teardown
- [ ] `src/core/Model.js` — the contract every figure implements
- [ ] `src/core/ModelHost.js` — mounts one model into a container
- [ ] `src/core/lazyRegistry.js` — generic lazy id → loader registry
- [ ] `src/core/registry.js` rebuilt on the factory, same public API
- [ ] `Scene` and `SceneHost` moved onto the viewport observable
- [ ] `src/core/index.js` re-exports the new surface

## Task 2 — the models layer

- [ ] `src/models/registry.js`, `src/models/index.js`, `models.css`
- [ ] `src/models/_template/` — copy-me model (js + css + manifest)
- [ ] `src/scenes/creatures/` moved to `src/models/creatures/`
- [ ] Creatures reworked as a `Model`: fit scale, stage-local pointer
- [ ] `src/styles/main.css` imports the models stylesheet

## Task 3 — one generic scene

- [ ] `src/scenes/showcase/` — hosts any model, forwards frames and input
- [ ] `src/scenes/index.js` registers the showcase; creatures deregistered
- [ ] `src/main.js` wires model → tile minimum → scene mount

## Task 4 — the tile: locked while animating, adaptive minimum

- [ ] `shellState.stageMin` and the `sizeLocked` derivation
- [ ] `src/shell/sizing.js` — one owner of measurement and clamping
- [ ] Adaptive minimum from the model's declared stage; maximum unchanged
- [ ] Resize handles and the size menu refuse to act while a scene runs
- [ ] Tile grows to fit a model that needs more room

## Task 5 — repository hygiene

- [ ] Remove `.gitkeep` from directories that now track real files
- [ ] ESLint: per-frame restrictions extended to `src/models/**`
- [ ] CI guardrails: models must not import shell, shell must not import
      models

## Verification

- [ ] `npm run validate` green
- [ ] Page loads with a clean console
- [ ] Motion watched: creatures run, hop, blink, track the pointer
- [ ] Resize locked while the scene runs, free when it is not
- [ ] Minimum size adapts to the model; maximum unchanged
- [ ] Mount / unmount / re-mount leaves no listener or effect behind

## Completion

- [ ] `.ai/memory/PROJECT_STATE.md` updated
- [ ] `.ai/memory/DECISIONS.md` appended
- [ ] Session artifact written
- [ ] Rule modules updated and `npm run ai:sync` run
- [ ] Checklist filled with `+`/`-`
- [ ] Final report
