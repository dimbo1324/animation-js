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
