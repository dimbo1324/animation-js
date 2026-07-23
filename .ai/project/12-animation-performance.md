# Animation Performance Doctrine

Binding for every scene, character, and loop. Code that violates one of
these is wrong and does not pass review. Budget: 16.6 ms per frame at
60 Hz; treat 8 ms of JavaScript as the ceiling.

## 1. One loop, driven by requestAnimationFrame

`setInterval`/`setTimeout` never drive animation. The shared `Ticker`
(`src/core/Ticker.js`) owns the one `requestAnimationFrame` loop; scenes
subscribe. A private loop in a scene desynchronises and multiplies layout
work. The ticker adapts to the display — never pin a frame rate.

## 2. Animate transform and opacity only

Compositor-only: `transform` (`translate3d`, `rotate`, `scale`) and
`opacity`. `filter` is acceptable but costs more.

Banned in a per-frame path, because each forces layout: `left`, `top`,
`right`, `bottom`, `width`, `height`, `margin`, `padding`,
`border-width`, `font-size`, `line-height`. Allowed only for one-off,
user-driven changes outside the loop — resizing the shell tile, say.

## 3. Never interleave DOM reads and writes

A geometric read after a style write forces a synchronous reflow; over N
elements that is N reflows per frame. Read everything first, then write.
Use `read()`/`write()` from `src/core/dom.js` when ordering cannot be kept
by hand.

Layout-forcing reads: `offsetWidth/Height/Top/Left`,
`clientWidth/Height`, `scrollWidth/Height/Top`, `getBoundingClientRect()`,
`getComputedStyle()`, `focus()`.

## 4. State lives in objects; the DOM is a projection

Never read state back out of the DOM or a CSS string
(`parseInt(el.style.left, 10)` is a bug). Keep `{ x, y, vx, vy }` in a
plain object, simulate it, then write `translate3d(...)`.

## 5. Separate update from render

```text
update(dt) : input -> physics -> AI -> animation state
render()   : write that state to the DOM
```

Never mutate the DOM in `update`; never compute simulation state in
`render`. `Scene` enforces the split via `onUpdate` and `onRender`. With
many entities, iterate in two passes rather than one interleaved pass.

## 6. Time-based motion, always

`x += 5` is a bug — twice as fast at 120 Hz. `x += speed * dt` is correct.
`dt` arrives in seconds, clamped, so a stalled tab cannot teleport an
entity. For deterministic physics use the ticker's fixed-step mode.

## 7. Do not allocate inside the frame

Allocation in `update`/`render` feeds the garbage collector, and GC pauses
are dropped frames. Mutate long-lived objects; hoist scratch values out of
the loop; avoid `map`/`filter`/spread in hot paths; pool elements instead
of creating and destroying nodes.

## 8. Know when the DOM stops being the right tool

1. **CSS animations** — declarative, off the main thread. Use when
   JavaScript adds nothing.
2. **DOM + JS + rAF** — tens to a couple hundred moving elements. The
   default tier here.
3. **Canvas 2D** — hundreds to thousands of objects.
4. **WebGL / WebGPU** — shaders, particle systems, heavy graphics.

Climbing is a decision, not a reflex: make it when DOM performance is
measurably the limit, record it in `.ai/memory/DECISIONS.md`, and keep the
`Scene` contract identical so the shell does not care.

## 9. Spatial partitioning before brute force

Pairwise checks are O(n²): 1000 entities is 1 000 000 tests per frame.
Past roughly 100 interacting entities, use a grid, quadtree, or spatial
hash and test only neighbours.

## 10. Standing obligations

- Every subscription, listener, and observer is removed in `onDestroy`.
- Pause when the document is hidden; the ticker does this already.
- Respect `prefers-reduced-motion` with a reduced or static path.
- Set `will-change` only while an element is actually animating.
- Do not animate more than a few dozen composited layers at once.
