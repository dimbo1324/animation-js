# Reactivity Doctrine: `new Proxy()` Is the Default

The owner's explicit architectural choice. Not renegotiable without them.

## The principle

State is wrapped in a `Proxy` so that reading it records a dependency and
writing it schedules exactly the work that depends on it — nothing more.
Manual `render()` calls, `setState`-style broadcasts, and "just redraw
everything" are forbidden.

`src/core/reactive.js` exposes three things:

```js
const state = reactive({ x: 0, mood: 'idle' });
const stop = effect(() => {
  el.style.transform = `translate3d(${state.x}px, 0, 0)`;
});
const label = computed(() => state.mood);
```

- `reactive(obj)` — deep `Proxy`; `get` tracks, `set` triggers.
- `effect(fn)` — runs `fn`, records what it read, re-runs on change.
  Returns a disposer. **Always keep it and call it in `onDestroy`.**
- `computed(fn)` — lazy, memoised, invalidated by its own dependencies.

## Why a Proxy

It covers property addition and deletion, not a fixed key set. Dependency
tracking is automatic and exact — no subscription lists to keep in sync,
no stale subscriptions. Writes that change nothing are dropped at the
source. It works on plain objects, so scene state stays ordinary
JavaScript.

## Non-negotiable behaviours of the implementation

1. **Equality guard.** A `set` whose value is `Object.is`-equal to the old
   one triggers nothing. The biggest single source of avoided work.
2. **Frame-batched flush.** Invalidated effects queue into a `Set` and
   flush once, on the next frame, in insertion order. Ten writes to one
   property in a frame produce one run. Never flush synchronously.
3. **Proxy caching.** Wrapping the same object twice returns the same
   proxy (`WeakMap`); wrapping a proxy returns it unchanged.
4. **Lazy deep wrapping.** Nested objects wrap on first read; untouched
   subtrees cost nothing.
5. **Re-entrancy safety.** An effect writing to its own dependency must
   not recurse; self-retriggers are dropped within a flush.
6. **Precise disposal.** Disposing removes the effect from every
   dependency set it joined. No leaks, no zombie effects.

## Where reactivity belongs — and where it does not

Use `reactive` for scene configuration and mode flags, UI-facing state
(theme, size, selected scene, paused), and anything a human toggles that
something else must respond to.

Do **not** use it for per-frame simulation state of many entities —
positions, velocities, physics bodies. Those live in plain objects,
mutated in `onUpdate`, written to the DOM in `onRender`. Proxy traps on a
thousand entities at 60 fps is exactly the overhead this doctrine exists
to avoid.

In one line: **reactive state drives structure and configuration; the
ticker drives motion.** Mixing them up costs frames.

## Measurements are not configuration

A size is produced once, by one owner, and several unrelated consumers
need it in the same frame it was taken. Batching it to the next frame
delays every consumer; tracking it through a proxy makes a measurement
look like something a human toggled.

So measurements travel on `src/core/Observable.js` instead: one publisher,
many subscribers, synchronous delivery, deduplicated by value, with the
current value delivered immediately to anyone who subscribes late.
`SceneHost` owns the only `ResizeObserver` on the stage and publishes the
viewport on `host.viewport`; `Scene` and `Model` subscribe through
`Mountable` and release on destroy.

Nothing else may call `getBoundingClientRect()` on the stage. If code
needs the stage's size or page offset, it takes the numbers that were
already measured.

## Rendering discipline that follows

- No effect writes to the DOM outside `onRender` or a `write()` batch.
- No effect reads geometry; measurement belongs in a `read()` batch.
- One effect per independent piece of output, not one that redraws a
  subtree.
- Prefer mutating existing nodes over rebuilding them. Creating and
  discarding elements per update is the DOM equivalent of allocating in
  the frame loop.
