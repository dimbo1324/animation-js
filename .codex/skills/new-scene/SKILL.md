---
name: new-scene
description: Use when adding a new animation, character, or cartoon to animation-js — scaffolding a scene folder, wiring it into the registry, and hooking it to the engine.
---

# Adding a Scene

A scene is one self-contained animation. Adding one must never require
editing shell code. If it does, the seam is wrong — stop and report that.

## Steps

1. Copy `src/scenes/_template/` to `src/scenes/<scene-id>/`. Use a
   kebab-case id that reads as a name (`walking-cat`, not `scene2`).
2. In `index.js`, extend `Scene` and set `static id` / `static title`.
3. Register the lazy loader in `src/scenes/index.js`.
4. Add the one-line `@import` for `scene.css` in `src/scenes/scenes.css`.
5. Nothing else in the repository changes.

## The contract

| Hook              | Runs                         | May do                        |
| ----------------- | ---------------------------- | ----------------------------- |
| `onMount()`       | once, after root is attached | build DOM, measure, subscribe |
| `onUpdate(dt)`    | every frame, before render   | simulate — **no DOM**         |
| `onRender(alpha)` | every frame, after update    | write `transform`/`opacity`   |
| `onResize(size)`  | on host resize (debounced)   | re-measure, re-layout         |
| `onDestroy()`     | once, on unmount             | undo everything from mount    |

`this.root` is yours. Never touch DOM outside it.

## Checklist before calling it done

- Motion is time-based (`speed * dt`), not per-frame constants.
- Frame path writes only `transform` and `opacity`.
- No DOM reads in `onRender`; no DOM writes in `onUpdate`.
- No allocation in `onUpdate`/`onRender` — entities and scratch objects are
  created once in `onMount`.
- Every listener, observer, and reactive effect disposer created in
  `onMount` is released in `onDestroy`. Destroying twice is safe.
- All styling in `scene.css`, scoped under the scene root class, using
  tokens from `src/styles/tokens.css`.
- `prefers-reduced-motion` has a sane path.
- Watched in the browser: smooth, survives a resize and a tab switch, stops
  cleanly on unmount, console is empty.
- `npm run validate` is green.

## Craft reminders

Correct motion is the floor, not the goal. Anticipation before a move,
overlap and follow-through after it, secondary motion on hair, cloth, and
limbs, and easing that matches the mass of the thing. Stagger related
elements. A rig that only translates reads as dead.
