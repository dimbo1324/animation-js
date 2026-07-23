# 2026-07-23 — Bootstrap the AI-assistant system and the project architecture

- **Assistant:** Claude Opus 4.8 (Claude Code)
- **Branch:** `main` (owner explicitly authorised working and pushing here
  for this task only)
- **Owner request:** Port the multi-assistant setup from
  `country-decision-atlas-r`, adapted for a hobby craft project: English
  only, docs and tests opt-in, `new Proxy()` reactivity and the
  `docs/PERFORMANCE.md` rules baked in as doctrine. Delete
  `docs/ARCHITECTURE.md` and `docs/PERFORMANCE.md`. Protect `main` locally.
  Make formatting stricter and vertical. Add CI and infrastructure.
  Separate shell code from animation code with a clean seam, keeping
  exactly one CSS and one JS reference in the HTML.

## What was done

Seven task groups; see `task-checklist.md` for the itemised outcome.

The parts that will matter later:

- `.ai/` is now the single source of truth. `scripts/ai/sync_agents.py`
  generates `AGENTS.md`, `GEMINI.md`, `.github/copilot-instructions.md`,
  and `.cursor/rules/animation-js.mdc` from the same modules;
  `scripts/ai/sync.mjs` is a cross-platform launcher so `npm run ai:sync`
  works without assuming a `python3` alias.
- `src/core/` is new: `scheduler.js`, `reactive.js`, `Ticker.js`,
  `dom.js`, `Scene.js`, `SceneHost.js`, `registry.js`, and a barrel
  `index.js`.
- The old monolithic `src/components/Tile.js` became `src/shell/*`, driven
  by reactive state rather than direct DOM writes.
- `src/scenes/walker/` is the reference scene; `src/scenes/_template/` is
  the copy-me starting point.
- `.githooks/` replaces husky. `reference-transaction` is the hook that
  actually makes `main` undeletable.

## Decisions taken

D-001 through D-008 in `DECISIONS.md`. The two least obvious:

- **D-006** dropped husky for tracked `.githooks/` + `core.hooksPath`.
  Husky cannot express a `reference-transaction` hook cleanly and adds a
  dependency for something git does natively.
- **D-005** allows `src/core/scheduler.js` to schedule a one-shot
  `requestAnimationFrame` for queue draining. "One loop" means one
  _persistent_ loop; the ticker drains the scheduler itself while running,
  so a running app never pays for a second callback.

## Files touched

Created: `.ai/**` (14 rule modules, memory, template), `CLAUDE.md`,
`.claude/**` (settings, launch, README, 6 agents, 4 skills), `.codex/**`
(mirror), `scripts/ai/*`, `scripts/setup/install-git-hooks.mjs`,
`scripts/dev-server.mjs`, `.githooks/*` (4 hooks), `.github/**` (2
workflows, dependabot, PR + 2 issue templates, CODEOWNERS),
`.gitattributes`, `.nvmrc`, `.vscode/*`, `src/core/**`, `src/shell/**`,
`src/scenes/**`, `src/styles/{tokens,base}.css`,
`src/utils/{math,easing}.js`, `task-checklist.md`.

Rewritten: `package.json`, `.prettierrc.json`, `.prettierignore`,
`eslint.config.js`, `.stylelintrc.json`, `.editorconfig`, `.gitignore`,
`public/index.html`, `src/styles/main.css`.

Deleted: `docs/ARCHITECTURE.md`, `docs/PERFORMANCE.md` (both requested),
`.husky/`, `src/scripts/`, `src/components/`, `src/styles/tile.css`,
`src/utils/helpers.js`, `config/build.example.js`,
`tests/unit/helpers.test.js`, stray root `.gitkeep`.

`docs/__arch__/` was not read, listed for analysis, or modified.

## Verification

- `npm install` — clean, 242 packages, 0 vulnerabilities.
- `npm run validate` — green: prettier, eslint (`--max-warnings=0`),
  stylelint, `ai:check`.
- **Engine, in Node with a fake rAF** (throwaway harness, not committed):
  21 checks. Effects run immediately and re-run batched; the equality
  guard drops no-op writes; three writes in one frame produce one run;
  nested objects are reactive; proxy identity is stable; disposal stops an
  effect; `computed` is lazy and invalidates correctly. Ticker: update
  always precedes render, `dt` is in seconds, `dt` clamps to `maxDelta` on
  a 59-second stall, a stopped ticker produces no frames, listeners run in
  priority order, disposers are idempotent.
- **Frame-rate independence, measured:** unbounded travel is exactly
  900 px in 10 s at 60, 120, and 144 Hz.
- **Git hooks, in a throwaway sandbox repo:** `git branch -D main` and
  `git branch -m main renamed` are both refused and `main` survives;
  deleting or force-pushing `origin/main` is refused; a legitimate
  fast-forward push and a brand-new remote branch are allowed; deleting
  non-`main` branches and committing on a feature branch still work.
  `commit-msg` rejects `wip`, `update`, `fix`, `feat: add`, and
  `banana: ...`, and accepts well-formed messages and merge commits.
- **Browser (partial):** the page loads with a clean console, the shell
  and the full walker rig build, the empty state hides once a scene
  mounts, and the tile is correctly themed on first paint. One captured
  animated frame showed the pipeline working end to end — actor at
  `translate3d(-250.869px, 0, 0)`, body at `translate3d(0, -13.989px, 0)
scale(1.067, 0.933)` — i.e. real displacement with correct
  squash-and-stretch.

## Dead ends

- **First attempt at the assembled ruleset was 41 KiB.** Codex reads at
  most `project_doc_max_bytes` (32 KiB default) of project instructions.
  Two rounds of trimming only got it to ~35 KiB without starting to cut
  actual rules. Resolution: keep the rules, raise the ceiling
  (`project_doc_max_bytes = 65536` in `.codex/config.toml`, script limit
  40 KiB), and add a **Non-negotiables** block to the generated intro so
  the hard rules survive a truncated read on a default setup. If the
  ruleset keeps growing, that block is the safety net — do not delete it.
- **Prettier reformats `.ai/**` and desynchronises the generated files.**
  Running `format` then `ai:check` fails. The pre-commit hook therefore
  runs lint-staged first and `ai:sync` second, then re-stages the
  generated files. Do not reorder those two steps.
- **`stylelint-disable` inside a multi-line `/* ... */` block does not
  register.** The directive must be the first thing in the comment, so it
  has to be a single-line comment. Cost half an hour of a confusing
  "has not been disabled" error in `src/styles/base.css:58`.
- **Clamping on turnaround made the walker frame-rate dependent.**
  `walker.x = range` throws away the part of the step past the boundary,
  so after 10 s of pacing the position differed by up to 0.75 px between
  60/120/144 Hz. Reflecting the overshoot (`x = 2 * range - x`) makes it
  exact at every rate. Use reflection, not clamping, for any bouncing
  boundary.
- **The Browser pane in this session was hidden, so `requestAnimationFrame`
  was suppressed** and continuous motion could not be watched. Anything
  that depends on frames looked broken until frames were forced. If a
  future session sees "nothing renders, no console errors, DOM is
  correct", check whether the page is compositing before debugging the
  engine.

## Open threads / handoff

1. **Nothing in the UI selects a scene.** `registry.listScenes()` exists
   and is unused; `main.js` mounts `DEFAULT_SCENE_ID` directly. A scene
   picker in the toolbar is the obvious next infrastructure piece — but
   only if the owner asks.
2. **Continuous motion has not been watched by a human.** Ask the owner to
   run `npm run dev` and confirm the walk reads correctly. The rig timings
   (`STRIDE_RATE`, `BOUNCE_HEIGHT`, `LIMB_SWING`) are first-guess values
   and almost certainly want tuning by eye.
3. **The tile's initial 70%/70% size comes from CSS**, then `activate()`
   replaces it with measured pixels on the first interaction-free frame.
   That is intentional, but it means the tile is briefly sized by
   percentage. If it ever flashes, that is where to look.
4. **Deleted `tests/unit/helpers.test.js`** — it imported a module that no
   longer exists and nothing ran it. `tests/` keeps its empty skeleton.
   The owner has not asked for tests; do not add a runner unprompted.
5. **`_template/scene.css` is not imported** by `scenes/scenes.css`, on
   purpose. If a copied scene appears unstyled, that is the missing line.
