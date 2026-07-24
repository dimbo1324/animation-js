# 2026-07-24 — Creatures scene, dark default, separated toolbar

- **Assistant:** Claude Opus 4.8 (Claude Code)
- **Branch:** `main` (owner authorised working and pushing here)
- **Owner request:** Dark theme by default. Move the demo character into an
  example that is not mounted on load, summoned by a button instead. Lucide
  icons only, never Unicode. Give the toolbar its own visually separate
  strip at the top of the tile. Replace the walker with three of the
  owner's creatures from `docs/__arch__/concepts/creatures.html`, running
  after each other in single file, and make the animation properly drawn.

## What was done

- **Dark by default.** `data-theme` moved from the tile onto `<html>`, and
  every palette became `:root[data-theme=…]`. `public/index.html` ships
  `data-theme="dark"` so the first paint is already correct.
- **Empty stage + summon button.** `shellState.sceneVisible` drives it;
  `src/shell/SceneToggle.js` flips the flag, an effect in `main.js` mounts
  or unmounts `DEMO_SCENE_ID`. The shell never learns a scene id.
- **Toolbar as a header strip.** Full-width bar on `--surface-muted` with a
  bottom border, scene label on the left (`SceneLabel.js`), controls right.
  Buttons moved to `--surface` so they read as raised against it.
- **Creatures scene** replaces `walker/`, ported from the owner's concept
  file and split into `Creature.js` (simulation), `CreatureView.js` (SVG
  writes), `Trail.js`, `geometry.js`, `species.js`, `moods.js`.
- **New engine primitives:** `src/utils/Spring.js`, `src/utils/noise.js`,
  `smoothstep`/`softCap`/`pickRandom` in `math.js`, `svgElement` in
  `core/dom.js`.
- **Icons:** Lucide `ghost`, `x`, `clapperboard` added to `icons.js` with
  reference copies in `src/assets/icons/`.

## Decisions taken

D-009 through D-013 in `DECISIONS.md`.

## Files touched

Created: `src/scenes/creatures/{index,Creature,CreatureView,Trail,geometry,species,moods}.js`
and `scene.css`; `src/shell/{SceneToggle,SceneLabel}.js`;
`src/utils/{Spring,noise}.js`; three Lucide SVGs.

Modified: `src/shell/{Tile,Toolbar,state,index,shell.css}`,
`src/styles/tokens.css`, `src/main.js`, `src/scenes/{index.js,scenes.css}`,
`src/scenes/_template/scene.css`, `src/utils/{math,icons}.js`,
`src/core/{dom,index}.js`, `public/index.html`.

Deleted: `src/scenes/walker/`.

`docs/__arch__/concepts/creatures.html` was read — the owner asked for it
explicitly in this conversation. It was not modified.

## Verification

- `npm run validate` green: prettier, eslint `--max-warnings=0`, stylelint,
  `ai:check`.
- In the browser, computed styles confirmed: `data-theme="dark"` on load,
  page `rgb(13,15,19)`, tile `rgb(26,29,36)`, toolbar `rgb(35,39,47)` with
  a `rgb(51,57,68)` bottom border and 46 px height — the strip is visibly
  its own surface. Stage empty on load, empty state shown, ghost button
  labelled "Позвать существ на сцену".
- After clicking the button: scene mounts, label becomes "Трое мешковатых",
  empty state hides, 3 creature groups + 3 shadows + 24 eye circles built,
  root gradient / crosshair cursor / ground `::after` all resolve.
- Chain motion sampled over ~4 s: `361,281,202` → `474,422,343` →
  `346,426,471`. Evenly spaced, correct order, and after the leader turns
  around the followers keep retracing its path — which is exactly the
  behaviour the trail is for. Per-creature Y differed each sample (hops are
  offset), and shadow `ry`/`opacity` tracked hop height.

**Not verified:** continuous motion was never watched by a human, and the
final render pass was confirmed _before_ the `.scene--creatures` CSS fix,
not after. That fix touched only a CSS selector, so it cannot affect the JS
render path — but it is an inference, not an observation. The Browser pane
in this session was hidden, which suppresses `requestAnimationFrame`
entirely; screenshots and rAF-driven checks both timed out.

## Dead ends

- **`.scene-creatures` vs `.scene--creatures`.** `SceneHost` writes
  `class="scene scene--<id>"`, but both the walker and the first draft of
  the creatures scene styled `.scene-<id>`. The scenes animate fine with no
  background, so the bug is silent. This is now D-011 and is called out in
  `_template/scene.css`.
- **Debugging through a hidden Browser pane wastes a lot of time.** Effects
  are frame-batched, so with no rAF a button click appears to do nothing.
  Worse, the dev server's live reload fires on every file save and resets
  page state between tool calls, which looked exactly like a broken toggle.
  Reach for `import('/src/core/index.js').then(m => m.flushScheduler())` to
  force a flush, and do click-then-assert in a single evaluation.
- **First draft ran simulation inside `onRender`** — travel accumulation
  and trail sampling sat in the render pass. Rewritten so `onUpdate`
  resolves everything into `#state` and `onRender` only writes it.
- **First draft stepped the pupil springs with a hardcoded `1 / 60`**
  instead of `dt`, which would have made gaze frame-rate dependent.

## Open threads / handoff

1. **Rig timings are first-guess values.** `RUN_SPEED`, `FOLLOW_DELAY`,
   `HOP_DISTANCE`, `HOP_HEIGHT`, `LEAN_DEGREES` in
   `src/scenes/creatures/index.js` want tuning by eye.
2. **Two of the owner's five creatures were left out** — Кубик (square) and
   Клин (triangle). Their definitions are trivial to add to `species.js` if
   the owner wants all five.
3. **`smoothClosedPath` allocates one string per creature per frame.** That
   is three strings, unavoidable for SVG path morphing, and deliberate. Do
   not "fix" it without measuring.
4. **No scene picker.** `registry.listScenes()` is still unused; the toggle
   mounts `DEMO_SCENE_ID` only.
5. **Moods still cycle** (`moods.js`) but a running creature is mostly
   happy/curious. If the cast ever stands still, the sleepy/yawn behaviour
   from the concept file is worth porting back.
