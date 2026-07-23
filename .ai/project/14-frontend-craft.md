# Frontend Craft Bar

Every assistant here operates at senior-plus frontend level and brings
full JavaScript, CSS, HTML, UI/UX, and motion-design skill to every task.
Default output is not "working" — it is what a strong engineer would sign.

## JavaScript

- Modern baseline: modules, classes, private `#fields`, optional
  chaining, nullish coalescing, destructuring.
- Real OOP where it earns its place: `Scene` subclasses, entity classes
  with `update`/`render`, clear public and private surfaces. Classes for
  behaviour with identity and lifecycle; plain functions for pure
  transforms. Never a class used as a namespace.
- Decompose relentlessly. A function does one thing; a module owns one
  concern. If a name needs "and" in it, it is two things.
- Names carry meaning: `elapsedSeconds`, not `t2`.
- Guard clauses over nested conditionals; early return over `else`.
- Pure where possible; side effects concentrated at the edges.
- `Map`/`Set` when the semantics are a map or a set; `WeakMap` for
  element-keyed metadata so nodes stay collectable.
- Every public function in `src/core/` carries a short JSDoc contract:
  params, return, and any lifecycle obligation on the caller.

## CSS

- Custom properties are the design system. Colours, spacing, radii,
  durations, easings come from `src/styles/tokens.css`. Raw hex values and
  magic numbers in component CSS are defects.
- BEM-ish predictable class names, scoped per component or scene
  (`.tile__toolbar`, `.scene-walker__leg`).
- Modern layout: flexbox, grid, `clamp()`, logical properties,
  `:is()`/`:where()` for cheap specificity.
- Flat specificity. No `!important` without a written reason. No ID
  selectors for styling.
- Styles never live in JavaScript: no injected `<style>` tags, no runtime
  style strings, no inline styles beyond the per-frame `transform` and
  `opacity` writes the loop legitimately needs.

## HTML and semantics

Semantic elements first; `div` only when nothing else fits. Interactive
controls are real `<button>`/`<input>` elements with the correct `type`,
never click-handled `div`s.

## UI/UX and accessibility

- Keyboard reachable, visible focus, sensible tab order.
- Correct ARIA on custom widgets, and none where a native element would
  have been right.
- Respect `prefers-reduced-motion` and `prefers-color-scheme`.
- Contrast that passes, in both themes. Touch targets at least 44 px.
- UI motion has intent: easing that matches the metaphor, 150-400 ms
  durations, never blocking the user.

## Motion design

Ease-out for entrances, ease-in for exits, spring or custom cubic-bezier
for anything with mass. Secondary motion sells a character: overlap,
follow-through, anticipation, squash and stretch — a rig that only
translates looks dead. Continuous loops need matching start and end
states. Stagger related elements rather than moving them in lockstep.

## Optimisation mindset

Correct first, clear second, fast third — but fast is a real requirement
here. Before calling a scene done, answer: what does it cost per frame,
how does it scale to 10× the entities, what does it allocate? If any
answer is unknown, measure before claiming.
