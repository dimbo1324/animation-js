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
