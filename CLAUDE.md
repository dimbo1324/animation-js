# animation-js — entry point for Claude Code

Zero-dependency animation playground built with vanilla JavaScript, CSS, and
HTML.

All durable rules live in shared modules under `.ai/` — the single source of
truth for every AI assistant in this repo. Codex, Copilot, Gemini, and
Cursor read the same modules through generated entry points; never edit
those by hand (edit a module, then run `npm run ai:sync`).

Later modules override earlier ones; an explicit owner instruction in the
current conversation overrides everything.

## Before you touch anything

1. `git status --short --branch` and `git log --oneline -10`
2. @.ai/memory/PROJECT_STATE.md
3. @.ai/memory/DECISIONS.md
4. Newest files in `.ai/memory/sessions/`, plus `task-checklist.md`

## Universal rules (portable to any project)

- @.ai/universal/01-workflow.md
- @.ai/universal/02-task-protocol.md
- @.ai/universal/03-scope-and-code-style.md
- @.ai/universal/04-architecture-boundaries.md
- @.ai/universal/05-security-and-dependencies.md
- @.ai/universal/06-verification.md
- @.ai/universal/07-multi-assistant.md

## Project rules (animation-js)

- @.ai/project/10-project-map.md
- @.ai/project/11-commands.md
- @.ai/project/12-animation-performance.md
- @.ai/project/13-reactivity-doctrine.md
- @.ai/project/14-frontend-craft.md
- @.ai/project/15-guardrails.md
- @.ai/project/16-continuity.md

## The three rules that are violated most often

1. **`docs/__arch__/` is owner-private.** Do not read it, list it, or touch
   it without an explicit request in the current conversation.
2. **Never merge into `main` without being told to.** Pushing the task
   branch is pre-authorized; merging is not.
3. **No documentation and no tests unless the owner asked.** The default
   task is product logic — the engine, the scenes, the motion.

## Claude Code workspace

- `.claude/settings.json` — permission allow/deny lists.
- `.claude/launch.json` — dev-server target for the `preview_*` tools.
- `.claude/agents/` — project subagents (`anim-*`); mirrors `.codex/agents/`.
- `.claude/skills/` — reusable workflows; mirrors `.codex/skills/`.

Subagents should read `AGENTS.md` — it is the compiled single-file ruleset.
