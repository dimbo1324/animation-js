# Task: bootstrap the AI-assistant system and the project architecture

Owner request, 2026-07-23. Working directly on `main` by explicit owner
instruction. Push to remote `main` authorised for this task only.

Legend: `+` done, `-` not done or partial.

## Preparation

- [+] Study `country-decision-atlas-r` (`.ai/`, `.claude/`, `.codex/`,
  `CLAUDE.md`, `AGENTS.md`) as the reference setup
- [+] Read the existing `animation-js` source and tooling
- [+] Read `docs/PERFORMANCE.md` before deleting it
- [+] Leave `docs/__arch__/` untouched

## Task 1 — AI assistant configuration

- [+] `.ai/universal/` — 7 portable rule modules, English only
- [+] `.ai/project/` — 7 project modules, English only
- [+] Performance doctrine translated from `docs/PERFORMANCE.md` and
  extended
- [+] `new Proxy()` reactivity doctrine written as a binding rule
- [+] Frontend craft bar (JS / CSS / HTML / UI-UX / motion / optimisation)
- [+] Guardrails: `docs/__arch__` private, `main` protected, no docs and no
  tests without a request
- [+] Continuity system: `.ai/memory/` with `PROJECT_STATE.md`,
  `DECISIONS.md`, `sessions/_TEMPLATE.md`
- [+] `scripts/ai/sync_agents.py` + cross-platform `sync.mjs` launcher
- [+] Generated entry points: `AGENTS.md`, `GEMINI.md`,
  `.github/copilot-instructions.md`, `.cursor/rules/animation-js.mdc`
- [+] `CLAUDE.md` with native `@` imports
- [+] `.claude/` — settings, launch, README, 6 agents, 4 skills
- [+] `.codex/` — config, README, 6 agents, 4 skills (name-for-name mirror)
- [+] `docs/PERFORMANCE.md` deleted after its content was absorbed

## Task 2 — remove the old architecture doc

- [+] `docs/ARCHITECTURE.md` deleted

## Task 3 — protect `main` locally

- [+] `.githooks/reference-transaction` refuses deletion of local `main`
- [+] `.githooks/pre-push` refuses deletion and force-push of remote `main`
- [+] `receive.denyDeletes` / `denyNonFastForwards` set locally
- [+] `.claude/settings.json` denies the destructive commands outright
- [+] Hook installation wired into `npm install`

## Task 4 — stricter, vertical formatting

- [+] Prettier: width 72, one attribute per line, trailing commas
  everywhere, operators at line start
- [+] ESLint: rewritten strict config, `--max-warnings=0`, project-specific
  restrictions on layout writes, timers, and private rAF loops
- [+] Stylelint: BEM pattern, no `!important` without justification, no id
  selectors, specificity ceiling, canonical property order
- [+] `.editorconfig` aligned to the 72-column rule

## Task 5 — infrastructure

- [+] `.github/workflows/quality.yml` — gate + guardrail greps
- [+] `.github/workflows/pages.yml` — live demo deploy
- [+] `dependabot.yml`, PR template, issue templates, `CODEOWNERS`
- [+] `.gitattributes`, `.nvmrc`, `.vscode/`
- [+] `scripts/dev-server.mjs` — dependency-free server with live reload
- [+] `package-lock.json` and `.vscode/` un-ignored and tracked

## Task 6 — shell / scene architecture

- [+] `src/core/` engine: scheduler, reactive, Ticker, dom, Scene,
  SceneHost, registry
- [+] `src/shell/` decomposed from the old monolithic `Tile.js`
- [+] `src/scenes/` with `_template/` and the `walker` reference scene
- [+] `public/index.html` reduced to exactly one CSS and one JS reference
- [+] `src/styles/main.css` as the single import root
- [+] Layer independence enforced in CI

## Task 7 — judgement calls

- [+] Design tokens introduced; raw hex values removed from components
- [+] Resize measures bounds once per drag instead of per pointer move
- [+] Teardown added everywhere (listeners, effects, observers, loop)
- [+] Keyboard and ARIA support for the size menu and the scene toggle
- [+] Dead scaffolding removed: `Button.js`, `config/build.example.js`,
  broken `tests/unit/helpers.test.js`, stray root `.gitkeep`
- [+] husky replaced with tracked `.githooks/`

## Verification

- [+] `npm install` — clean, 0 vulnerabilities
- [+] `npm run validate` — prettier, eslint, stylelint, ai:check all green
- [+] Engine verified in Node with a fake rAF: 21 checks on reactivity
  batching, equality guard, disposal, computed, and ticker ordering,
  `dt` clamping, and priority
- [+] Frame-rate independence measured: 900 px in 10 s at 60/120/144 Hz
- [+] Git hooks proven in a throwaway sandbox repo: `main` survives
  `branch -D` and `branch -m`; force-push and delete of `origin/main`
  refused; fast-forward push allowed; `commit-msg` accepts and rejects
  the right messages
- [+] Page loads with a clean console; shell and full walker rig build;
  tile correctly themed on first paint; one captured frame shows real
  displacement with squash-and-stretch
- [-] Continuous motion NOT watched by a human. The Browser pane in this
  session was hidden, which suppresses `requestAnimationFrame`, so the
  walk could not be observed running. Owner should run `npm run dev`.
- [-] Resize dragging and theme toggling NOT exercised interactively, for
  the same reason. Their logic is covered by review only.

## Completion

- [+] `.ai/memory/PROJECT_STATE.md` written
- [+] `.ai/memory/DECISIONS.md` seeded with D-001..D-008
- [+] Session artifact written to `.ai/memory/sessions/`
- [+] Checklist filled honestly
- [+] Final report delivered
