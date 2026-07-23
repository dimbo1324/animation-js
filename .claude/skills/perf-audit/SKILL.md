---
name: perf-audit
description: Use when animation-js drops frames, stutters, feels heavy, or before declaring a scene with many entities finished — auditing code against the frame budget.
---

# Frame-Budget Audit

Budget: 16.6 ms per frame at 60 Hz. Treat 8 ms of JavaScript as the ceiling.

## Static sweep

Grep the frame path for the usual suspects:

```bash
grep -rnE "offset(Width|Height|Top|Left)|client(Width|Height)|getBoundingClientRect|getComputedStyle" src/
grep -rnE "style\.(left|top|right|bottom|width|height|margin|padding)" src/
grep -rn "requestAnimationFrame" src/
grep -rnE "set(Interval|Timeout)" src/
```

Findings that matter:

- A geometric read after a style write in the same frame → forced reflow.
- A layout property written per frame → use `transform` instead.
- More than one `requestAnimationFrame` loop → everything goes through the
  shared `Ticker`.
- A timer driving animation → replace it.

## Read the hot path

Open `onUpdate` and `onRender` and look for allocation: object and array
literals, closures, `map`/`filter`/spread, node creation. All of it feeds
the garbage collector, and GC pauses are dropped frames. Hoist it into
`onMount`.

Then check reactivity: proxies must not sit on per-entity simulation state.
Effects must not read geometry. Effect disposers must be kept and released.

## Measure before concluding

Static analysis finds the obvious. For the rest, run `npm run dev` and use
the browser's Performance panel:

- Long tasks and their call stacks
- "Recalculate Style" and "Layout" entries inside the frame — these should
  be near zero during animation
- Composited layer count
- Heap sawtooth, which means per-frame allocation

## Report

Order findings by frame cost. For each: `file:line`, why it costs, the
concrete fix. Separate confirmed from suspected. Say what you did not
measure. Never claim a speedup you did not observe.

If the scene has genuinely outgrown the DOM tier, say so with numbers, and
record the decision in `.ai/memory/DECISIONS.md` before rewriting anything.
