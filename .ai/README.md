# AI Assistant Rule Modules

Single source of truth for the rules that govern every AI assistant working
in this repository (Claude Code, Codex, Copilot, Gemini, Cursor, and any
future agent).

Everything here is written in English on purpose: all models read the same
text, in the same language, with no translation drift.

## How it works

```text
.ai/universal/*.md   Portable rules. Valid for ANY project. Never mention
                     project names, paths, or stack specifics.
.ai/project/*.md     Rules specific to THIS project: repo map, commands,
                     animation performance doctrine, reactivity doctrine,
                     guardrails, continuity.
.ai/memory/          Cross-session memory. Task artifacts, project state,
                     decision log. This is how a new chat catches up.
CLAUDE.md            Entry point for Claude Code. Imports every module via
                     native @path syntax.
AGENTS.md            Entry point for Codex and every other agent that reads
                     AGENTS.md. GENERATED. Never edit by hand.
```

Generated mirrors (all produced from the same modules):

| Target file                       | Consumer                      |
| --------------------------------- | ----------------------------- |
| `AGENTS.md`                       | Codex, and most modern agents |
| `.github/copilot-instructions.md` | GitHub Copilot                |
| `GEMINI.md`                       | Gemini CLI / Code Assist      |
| `.cursor/rules/animation-js.mdc`  | Cursor                        |

Modules load in filename order: `universal/01..NN` first, then
`project/10..NN`. Later content overrides earlier content, so project rules
win over universal rules when they conflict.

## Editing rules

1. Edit or add a module under `.ai/universal/` or `.ai/project/`.
2. Regenerate every mirror: `npm run ai:sync`.
3. Commit the module and all regenerated files together.

`npm run ai:check` fails if the mirrors drift from the modules. It runs in
CI and in the pre-commit hook, so drift cannot reach `main`.

Never edit a generated file directly — it carries a generated-file banner
and any manual edit is lost on the next sync. `CLAUDE.md` is hand-written
and needs no regeneration; Claude Code resolves `@` imports at session
start.

## Rule evolution (important)

These modules are not frozen. When an assistant learns something durable —
a convention the owner corrected, a trap in the stack, a boundary that was
not written down — it must encode that lesson here in the same task, then
run `npm run ai:sync`. A lesson that lives only in a chat transcript is a
lesson the next assistant will have to relearn.

Rules of thumb for what goes where:

- Applies to any project, any stack → `.ai/universal/`
- Applies to this project only → `.ai/project/`
- Applies to one task or one point in time → `.ai/memory/`

## Porting to another project

1. Copy `.ai/universal/` unchanged.
2. Copy `CLAUDE.md` and `scripts/ai/sync_agents.py`; adjust the header
   constants at the top of the script.
3. Rewrite everything under `.ai/project/` for the new project.
4. Run the sync script to produce the new generated entry points.

Keep universal modules truly universal: if a rule needs a project path or a
project command to make sense, it belongs in `.ai/project/`.
