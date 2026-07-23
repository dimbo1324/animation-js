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
