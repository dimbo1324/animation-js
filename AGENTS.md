<!--
GENERATED FILE - DO NOT EDIT.
Source of truth: .ai/universal/*.md and .ai/project/*.md.
Edit a module, then run: npm run ai:sync
-->

# animation-js - shared ruleset for Codex and any AGENTS.md-aware agent

This file is the shared ruleset for animation-js: Zero-dependency animation playground built with vanilla JavaScript, CSS, and HTML.

It is assembled from the rule modules in `.ai/` so that every AI assistant
working on this repository follows identical rules. Later sections override
earlier ones; an explicit owner instruction in the current conversation
overrides everything.

Start of every session: read `.ai/memory/PROJECT_STATE.md`,
`.ai/memory/DECISIONS.md`, and the newest files in `.ai/memory/sessions/`.
End of every session: update them.

## Non-negotiables, in case you read nothing else

1. `docs/__arch__/` is owner-private. Do not read, list, edit, or delete
   anything in it without an explicit request in this conversation.
2. Never delete `main`, never force-push to it, and never merge into it
   without an explicit owner instruction. Pushing a task branch is fine.
3. No documentation and no tests unless the owner asked. The default task
   is product logic: the engine, the scenes, the motion.
4. `public/index.html` references exactly one CSS file and one JS module.
5. `src/shell/` and `src/scenes/` never import each other.
6. Animate `transform` and `opacity` only; one shared rAF loop; motion
   scaled by `dt`; nothing allocated inside a frame.
7. State goes through `reactive()` (`new Proxy`), never a manual redraw —
   except per-entity simulation state, which stays in plain objects.
8. `AGENTS.md` and the other entry points are generated. Edit `.ai/`, then
   run `npm run ai:sync`.

---

<!-- module: .ai/universal/01-workflow.md -->

# Workflow: Git, Branches, Commits

One predictable git cycle per task. No exceptions without an explicit
owner instruction in the current conversation.

## Chain of command

The owner is the team lead; assistants are the senior engineers. Work
starts because the owner asked, never because an assistant decided
something looked worth doing. Ideas and concerns go in the final report;
acting on them unasked does not.

## Branch discipline

- One task, one branch. Do not develop on `main` unless the owner said to
  for this task.
- Start from up-to-date `main`: `git checkout main` →
  `git pull --ff-only origin main` → `git checkout -b <branch>`.
- Name format `type/short-task-description`, types: `feat`, `fix`,
  `refactor`, `perf`, `chore`, `ci`, `docs`, `test`.
- Uninformative names (`test`, `fix`, `work`, `final`, `new`) are
  forbidden.

## Commits

- Message format: `type: short description of what and why`.
- Intermediate commits during a task are expected — they make the work
  reviewable and recoverable. Do not save everything for one giant commit.
- One commit = one logically complete step.
- Forbidden messages: `fix`, `update`, `wip`, `changes`, `final`, `123`.

## Push and merge authority

- Pushing the **task branch** at the end of the task is pre-authorised.
  No need to ask.
- Merging into `main` is **forbidden without an explicit owner instruction
  in the current conversation.** Not implied by "finish the task", not by
  a green check run, not by the branch being ready. The owner must say it.
- When permission is given: fast-forward only, after the gate is green.
- Force-pushing to `main` and deleting `main` are permanently forbidden.
  Local git hooks enforce this; do not disable them.
- Delete a task branch only after it is merged.

When unsure whether something counts as "explicitly requested": stop after
the branch push and report instead of merging.

---

<!-- module: .ai/universal/02-task-protocol.md -->

# Task Protocol: Checklist, Artifacts, Definition of Done

Every task is planned before it starts and honestly accounted for after it
ends, on disk, so a reviewer — or a different assistant in a brand-new
chat — can reconstruct it without the conversation.

## Orientation ritual — before touching anything

1. `git status --short --branch` and `git log --oneline -10`.
2. `.ai/memory/PROJECT_STATE.md` — what exists right now.
3. `.ai/memory/DECISIONS.md` — what must not be undone.
4. `task-checklist.md` — the previous task, and whether it finished
   cleanly.

Never skip this because the context looks familiar. Files change between
sessions; memory of a previous session is not evidence.

## task-checklist.md

Lives in the repository root, always tracked, never in `.gitignore`.

Before starting: rewrite it for the new task as `[ ]` items grouped into
short sections (preparation / implementation / verification / completion),
then commit it before the main work.

After finishing: mark every item `+` done or `-` not done, and commit it
with the work. Never hide unfinished items — a `-` with an honest note is
correct; a silently dropped item is a violation.

## Session artifact

Every non-trivial task leaves one file in `.ai/memory/sessions/`, named
`YYYY-MM-DD-short-slug.md`, based on `_TEMPLATE.md`. It records goal,
decisions, files touched, what was verified, dead ends, and the handoff
note. This is what makes a lost chat harmless.

## Definition of Done

- code written and matching the task, without unrequested scope
- code formatted and lint-clean
- the app still runs; no new console errors
- no secrets, no temp files, no edits in unrelated files
- rule modules updated if the task changed how the team works, then synced
- `.ai/memory/` updated (state / decisions / session artifact)
- checklist filled with `+`/`-`
- final report written

## Final report

Always the last step. What was done; which files and areas changed; which
checks ran and their actual results; any dependency or config change;
performance, compatibility, and accessibility risks; and — explicitly —
anything not done, skipped, or failed.

A report that hides a failing check is worse than a failing check.

---

<!-- module: .ai/universal/03-scope-and-code-style.md -->

# Scope Control and Code Style

Change only what the task requires; keep code readable without decoration.

## Minimal changes

Touch only what the task needs. Forbidden without necessity:
mass-reformatting unrelated files, renaming outside the task,
restructuring architecture "while at it", rewriting working code without
cause, deleting functionality without a direct requirement.

Discovered an unrelated problem? Record it in the final report and in
`.ai/memory/` — do not mix it into the diff.

## Documentation is opt-in

- Do NOT write or restyle documentation (`README`, `*.md`, `*.txt`,
  changelogs) unless the owner asked for it in the current task.
- Exception: the governance files themselves (`.ai/`, `CLAUDE.md`,
  generated agent entry points, `.ai/memory/`). Those are infrastructure
  and must always be accurate.
- If an existing doc becomes factually wrong because of your change, the
  minimal correction is allowed. A rewrite is not.

## Tests are opt-in

- Do NOT write, scaffold, or expand automated tests unless the owner asked
  in the current task.
- Verification still happens — by running the thing and looking at it (see
  the verification module).
- Never delete or weaken an existing test to make something pass.
- When tests are requested, write real ones: happy path, edge cases, and a
  regression case for any bug being fixed.

## What the default task actually is

Product logic. Here that means the animation engine, scenes, characters,
motion, and the interface hosting them. Infrastructure, tooling, docs, and
tests are supporting work, done on request.

## Comments

- No comments unless genuinely necessary. Structure and naming carry the
  meaning.
- A comment is allowed only when important logic stays non-obvious even
  with good naming, and must explain the non-obvious _why_, never restate
  the code.
- Stale, false, or misleading comments are forbidden. No docstrings that
  repeat a function name. Match the surrounding file's comment density.

## File size

- Code files under ~400 lines; split by meaning when approaching it.
- Entry-point files under ~50 lines. They wire modules and nothing else.
- A file needing a table of contents to navigate is already too big.

---

<!-- module: .ai/universal/04-architecture-boundaries.md -->

# Architecture Boundaries, Workarounds, Tech Debt

Respect the layering; make every shortcut visible.

## Boundaries

- Follow the existing architecture. Forbidden: domain logic in the
  presentation layer when a domain layer exists; reaching around an
  abstraction built for exactly this purpose; circular dependencies;
  dumping unrelated logic into catch-all files (`utils.js`, `helpers.js`,
  `common.js` as landfills).
- Layer direction is one-way. Lower layers never import from higher ones.
- If the architecture genuinely blocks the task, do not hack around it —
  propose a structural change, get the owner's decision, record it in
  `.ai/memory/DECISIONS.md`.

## Design principles that are not optional

- **Single responsibility.** One module, one reason to change.
- **Composition over inheritance**, except where a base class genuinely
  models an "is-a" contract subclasses must honour.
- **Program to the contract**, not the implementation.
- **Dependency inversion.** A module receives its collaborators; it does
  not reach into global state to find them.
- **Immutability at boundaries**, mutation only inside the owner of the
  data. Shared mutable state is a bug waiting for a schedule.
- **Fail loudly.** Missing configuration or a violated invariant throws.
  It never silently falls back to a second source of truth.

## Temporary solutions and tech debt

- Workarounds are exceptional. Record why each exists, where it lives, its
  limits, and what must replace it.
- Hidden workarounds are forbidden. Do not scatter uncontrolled
  `TODO`/`FIXME`; real debt gets an entry in `.ai/memory/`.
- Debt that cannot be fixed now is stated in the final report, never
  disguised as a normal solution. Debt touching correctness, performance,
  or accessibility is priority debt — call it out loudly.

---

<!-- module: .ai/universal/05-security-and-dependencies.md -->

# Security, Secrets, Dependencies, Portability

## Secrets — absolute ban

- NEVER put in code, git, tests, or examples: passwords, API keys, tokens,
  private keys, real credentials, cookies, production `.env`, or personal
  data.
- Secrets live only in an untracked `.env`, environment variables, or CI
  secrets. The repo may contain only a safe `.env.example`.
- A secret that ever reached git is compromised: rotate it. Deleting the
  line in a later commit is not enough.

## Security in every task

Within the area you touch, check: untrusted input rendered into the DOM,
`innerHTML` with anything not authored in this repo, `eval`/`new
Function`, URL parameters reflected into the page, third-party scripts,
and anything that would let page content become instructions.

For this stack specifically: `innerHTML` is allowed only for static
strings authored in this repository (inline SVG constants, for example).
Anything from user input, storage, or the network goes through
`textContent` or explicit DOM construction.

## Dependencies

This project is deliberately close to zero-dependency at runtime. That is
a feature.

- **No new runtime dependency without the owner's approval.** Ask first,
  with a one-line justification: what for, why it cannot be ~50 lines of
  local code, how heavy, how maintained.
- Dev dependencies (linters, formatters, CI helpers) may be added when the
  task is about tooling, and must be named in the final report.
- Never add a library for one small function.
- After changing dependencies, verify the install and the quality gate.

## Portability

- No machine-specific values in code: local absolute paths, usernames, IDE
  settings, hard-coded non-configurable ports.
- The project must stay runnable by someone else with only the documented
  commands, on Windows, macOS, and Linux.
- Target modern evergreen browsers. Do not add transpilation, polyfills,
  or build steps nobody asked for.

---

<!-- module: .ai/universal/06-verification.md -->

# Verification: Prove It Works

"It should work" is not a result. Every task ends with evidence.

## The verification ladder

Automated tests are opt-in here, so verification leans on the other rungs.
Use the highest rung the task allows:

1. **Static gate** — formatter, linters, generated-rules sync check.
   Always run. Non-negotiable.
2. **Run it** — start the dev server, load the page, exercise what
   changed, look at the console. An empty console is part of the result.
3. **Observe the motion** — watch anything animated. Smooth, not drifting
   with frame rate, stops when it should, survives a resize and a tab
   switch.
4. **Measure** — when a change could plausibly cost frames, look at frame
   timing before claiming it is fine.
5. **Automated tests** — when the owner asked for them.

## Errors and logging

- Handle errors explicitly. Forbidden: silently swallowed errors, empty
  `catch` blocks, debug logging left behind.
- `console.log` used for debugging is removed before the final commit.
  Intentional permanent diagnostics must look intentional.
- An error message says what broke, where, and with what context.

## Cleanup obligations

Anything that starts must be able to stop. Every task adding a loop,
listener, observer, or timer also adds the code that tears it down, and
must answer "what happens when this is unmounted twice?".

Leaked listeners and orphaned animation frames are correctness bugs, not
style issues.

## Honest reporting

State the command you ran and its actual outcome. If a check was skipped,
say so and why. Never describe an intended check in the past tense.

---

<!-- module: .ai/universal/07-multi-assistant.md -->

# Multi-Assistant Collaboration: One Shared Brain

Several AI assistants, in separate sessions, across different models and
vendors, work on this repo as one team. Chats are disposable; the
repository is the memory.

## The core assumption

Assume every chat will be lost, and that the next session is a different
model that has never seen this project. Everything that matters lives in
files:

- durable rules → `.ai/universal/`, `.ai/project/`
- current reality → `.ai/memory/PROJECT_STATE.md`
- binding decisions → `.ai/memory/DECISIONS.md`
- what just happened → `.ai/memory/sessions/`, `task-checklist.md`
- what actually shipped → `git log`

If a fact exists only in the conversation, it does not exist.

## One source of truth

- All assistants obey the same modules under `.ai/`.
- `CLAUDE.md` imports them natively. Every other entry point (`AGENTS.md`,
  Copilot, Gemini, Cursor) is GENERATED from the same modules.
- Never hand-edit a generated entry point. Edit the module, run the sync
  command from the project commands module, commit both together.
- Per-assistant workspaces (`.claude/`, `.codex/`) are name-for-name
  mirrors. Change one side, change the other in the same task.

## Rule evolution

The rule set grows with the project. When you learn something durable — an
owner correction, a stack trap, a convention that turned out to matter:

1. Decide the scope: universal rule, project rule, or memory entry.
2. Write it in the smallest place that covers it. Prefer sharpening an
   existing rule over adding a new one.
3. Re-run the sync command.
4. Mention the rule change in the final report so the owner can veto it.

Do not encode one-off preferences as permanent rules, and never rewrite a
rule the owner set without their approval.

## Coordination through git

- Before non-trivial work, read `git log --oneline -10` and
  `git status --short --branch`. Recent commits may be another
  assistant's finished work — not yours to redo or second-guess.
- Never rewrite history on a branch you did not create.
- Keep commits attributable; follow the trailer convention visible in
  recent `git log` output.

## Conflict resolution

A project module beats a universal module; an explicit owner instruction
in the current conversation beats both. Say out loud which rule you
applied and why.

---

<!-- module: .ai/project/10-project-map.md -->

# Project: animation-js

A zero-dependency playground for building complex animations, cartoon
characters, and animated graphical processes with nothing but vanilla
JavaScript, CSS, and HTML. No framework, no bundler, no runtime library.

A personal craft project, not a product. The bar is not "shipped", it is
**excellent frontend engineering**: clean decomposition, real
architecture, and motion that holds a stable frame budget.

## The one hard structural rule

`public/index.html` links **exactly two** assets and never more:
`src/styles/main.css` and `src/main.js`. Everything else is reached from
inside those two — CSS through `@import`, JavaScript through ES module
`import`. A third reference in the HTML is a rule violation.

## Repository map

```text
public/index.html   Single page. Two asset references.
src/main.js         Entry point. Wires shell + engine + scene. <50 lines.
src/core/           The engine. Scene-agnostic, no DOM chrome.
src/shell/          The frame: tile, toolbar, theme, resize.
src/scenes/         One folder per animation. Self-contained.
src/styles/         Tokens, base layer, and the `main.css` import root.
src/utils/          Small pure helpers (math, easing, icons).
scripts/            Tooling: dev server, rule sync, hook install.
.ai/                Assistant rule modules and cross-session memory.
.claude/ .codex/    Per-assistant workspaces, kept as mirrors.
.githooks/          Local git hooks, including `main` protection.
docs/__arch__/      OWNER-PRIVATE. See the guardrails module.
```

## The shell / scene separation

The architectural spine, and the reason the project exists.

- **Shell** is the container: the card, its chrome, its theme, its resize
  behaviour. Written once, rarely changed. Never imports from
  `src/scenes/`.
- **Scene** is one animation: characters, motion, its own CSS, its own
  state. It receives a root element and owns everything inside it. Never
  reaches outside that root; never imports from `src/shell/`.
- **Core** is the bridge and the machinery both stand on: ticker,
  reactive state, DOM batching, the `Scene` base class, the registry.
  Imports from neither.

Import direction is one-way, enforced by review and by CI:

```text
main.js -> shell, core, scenes
shell   -> core, utils
scenes  -> core, utils
core    -> utils
utils   -> (nothing)
```

Adding an animation must never require editing shell code. If it does,
the seam is wrong — fix the seam.

## Adding a scene

Copy `src/scenes/_template/` to `src/scenes/<scene-id>/`, extend `Scene`
in `index.js`, style it in `scene.css` scoped under the scene root class,
then register it in `src/scenes/index.js` and add the one-line `@import`
in `src/scenes/scenes.css`. Nothing else changes.

---

<!-- module: .ai/project/11-commands.md -->

# Project Commands and Quality Gate

All commands run from the repository root. Node 22+, npm 10+.

```bash
npm install     # also installs git hooks via `prepare`
npm run dev     # live-reload server on http://localhost:5173
npm run validate  # THE GATE: format check, eslint, stylelint, ai:check
npm run fix     # eslint --fix, stylelint --fix, prettier --write
npm run ai:sync # regenerate agent entry points from .ai/
npm run ai:check  # fail if they drifted
```

`npm install` points git at `.githooks/`. Those hooks protect `main` —
never run `git config --unset core.hooksPath`, never use `--no-verify`.

`npm run dev` serves the repository root and opens `public/index.html`.
Any change under `src/` or `public/` reloads the page. This is the primary
way to verify work here.

`npm run validate` must be green before the task is reported done and
before any merge into `main`.

## After editing anything under .ai/

Run `npm run ai:sync`, then commit the module and every regenerated file
together. `AGENTS.md`, `.github/copilot-instructions.md`, `GEMINI.md`, and
`.cursor/rules/animation-js.mdc` are generated; editing them by hand is a
rule violation and the next sync discards the edit.

The assembled ruleset must stay under the size ceiling in
`scripts/ai/sync_agents.py` — Codex reads at most 32 KiB of project
instructions by default. The script fails loudly if a module pushes it
over. Trim prose; never drop a rule.

## Git hooks (automatic, do not bypass)

| Hook                    | What it does                                      |
| ----------------------- | ------------------------------------------------- |
| `reference-transaction` | Refuses any deletion of the local `main` branch   |
| `pre-commit`            | Formats and lints staged files; re-syncs rules    |
| `commit-msg`            | Enforces `type: description` messages             |
| `pre-push`              | Refuses force-push or delete of `main`; runs gate |

If a hook fires, fix the cause.

## CI

`.github/workflows/quality.yml` runs the same gate plus guardrail checks
on push and pull request. `.github/workflows/pages.yml` publishes the demo
from `main`. CI is a safety net, not the primary check.

---

<!-- module: .ai/project/12-animation-performance.md -->

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

---

<!-- module: .ai/project/13-reactivity-doctrine.md -->

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

## Rendering discipline that follows

- No effect writes to the DOM outside `onRender` or a `write()` batch.
- No effect reads geometry; measurement belongs in a `read()` batch.
- One effect per independent piece of output, not one that redraws a
  subtree.
- Prefer mutating existing nodes over rebuilding them. Creating and
  discarding elements per update is the DOM equivalent of allocating in
  the frame loop.

---

<!-- module: .ai/project/14-frontend-craft.md -->

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

---

<!-- module: .ai/project/15-guardrails.md -->

# Project Guardrails

Hard limits. Violating one is a serious error, not a judgement call.

## `docs/__arch__/` is the owner's private folder

**Do not read it. Do not list its contents for analysis. Do not edit,
move, rename, or delete anything inside it. Do not use it as input to any
decision.**

It stays in git, untouched, unless the owner explicitly asks for something
there in the current conversation. Treat it as outside the repository.

## `main` is protected

- Never delete `main`, locally or remotely. Local git hooks refuse it; do
  not disable them.
- Never force-push to `main` or rewrite its history.
- Never merge into `main` without an explicit owner instruction in the
  current conversation.

## Nothing happens without a request

Assistants execute owner requests. They do not start refactors,
redesigns, dependency upgrades, documentation drives, or test suites on
their own initiative. Suggestions belong in the final report.

## Documentation and tests are opt-in

No `README`/`*.md` authoring and no test scaffolding without a direct
request. Exceptions: the governance files (`.ai/`, `CLAUDE.md`, generated
entry points) and `task-checklist.md`, which are infrastructure.

## The HTML contract

`public/index.html` references exactly one stylesheet
(`src/styles/main.css`) and exactly one script (`src/main.js`). No third
asset reference, ever.

## The layering contract

`shell` must not import from `scenes`; `scenes` must not import from
`shell`; `core` imports from neither. Adding an animation must not require
editing shell code.

## Runtime dependencies

Vanilla JavaScript, CSS, and HTML with zero runtime dependencies. Adding
one requires the owner's explicit approval, asked for before installing.

## Generated files

`AGENTS.md`, `.github/copilot-instructions.md`, `GEMINI.md`, and
`.cursor/rules/animation-js.mdc` are generated from `.ai/`. Never edit
them by hand. Edit the module, run `npm run ai:sync`, commit both.

---

<!-- module: .ai/project/16-continuity.md -->

# Continuity: How a New Chat Catches Up in Five Minutes

The owner may lose or delete a conversation at any moment. A different
assistant, on a different model, must be able to open this repository
cold and be productive. That works only if every session pays a small tax
on the way out.

## Where the truth lives

| Question                       | File                               |
| ------------------------------ | ---------------------------------- |
| How we work                    | `.ai/universal/*`, `.ai/project/*` |
| What exists now, and its shape | `.ai/memory/PROJECT_STATE.md`      |
| What must not be undone        | `.ai/memory/DECISIONS.md`          |
| What happened recently         | `.ai/memory/sessions/`             |
| The current or last task       | `task-checklist.md`                |
| What actually shipped          | `git log --oneline -20`            |

## Cold-start reading order

`AGENTS.md` (or `CLAUDE.md`) → `PROJECT_STATE.md` → `DECISIONS.md` → the
newest files in `sessions/` → `task-checklist.md` and
`git log --oneline -20` → `src/main.js`, `src/core/`, then the scene in
play.

Six files and one git command. If that is not enough to start work, the
memory has decayed — fixing it is the first task.

## Writing duties at the end of every task

Not optional, not "if time permits".

- **PROJECT_STATE.md** — update whenever the system's _shape_ changed: a
  new module in `core`, a new scene, a new seam, a changed contract, a
  new command. Present tense; it describes now, not history.
- **DECISIONS.md** — append when a choice constrains the future: an
  architectural direction, a rejected approach and why, an owner ruling,
  a performance tradeoff. Date, decision, reason, consequence. Never
  rewrite or delete an entry; supersede it with one referencing it.
- **sessions/** — one file per task, from `_TEMPLATE.md`. What was
  attempted, what surprised you, what you would tell your replacement.
- **Rule modules** — if the task revealed a durable rule, encode it in
  `.ai/` and run `npm run ai:sync`.

## Quality bar for memory entries

Write for a stranger. Name files and symbols — "the helper" means nothing
next month. Record _why_; the _what_ is in `git log`. Record dead ends,
because the next assistant will otherwise pay for them again. Absolute
dates, never "yesterday". Keep it short: memory nobody reads does not
exist.

## Anti-drift rule

If the memory and the code disagree, **the code is the fact and the
memory is stale.** Reconcile in the same task, or state the mismatch in
the final report. Silently rotting memory is worse than none, because it
is trusted.
