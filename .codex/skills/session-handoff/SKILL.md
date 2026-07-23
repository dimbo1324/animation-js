---
name: session-handoff
description: Use at the end of any animation-js task, or when the owner says a chat is ending or being lost — writing the memory artifacts that let a fresh assistant resume with no conversation history.
---

# Session Handoff

Assume this chat will be deleted. Everything that matters must be on disk
before the task is reported as done.

## Write, in this order

1. **`.ai/memory/sessions/YYYY-MM-DD-<slug>.md`** — from `_TEMPLATE.md`.
   The narrative layer: what was attempted, what surprised you, what you
   would tell your replacement. The **Dead ends** section is the most
   valuable part — do not leave it empty out of politeness.
2. **`.ai/memory/PROJECT_STATE.md`** — only if the system's _shape_
   changed: a new module in `core`, a new scene, a changed contract, a new
   command. Rewrite in place, present tense. It describes now, not history.
3. **`.ai/memory/DECISIONS.md`** — append if a choice was made that
   constrains the future. Date, decision, reason, consequence. Append-only:
   supersede old entries, never edit or delete them.
4. **`.ai/` rule modules** — if the task revealed a durable rule, encode it,
   then run `npm run ai:sync` and mention the rule change in the report so
   the owner can veto it.
5. **`task-checklist.md`** — mark every item `+` or `-`. An honest `-` with
   a note is correct; a silently dropped item is a violation.

## Then

```bash
npm run validate
git add -A
git commit -m "type: what and why"
git push -u origin <branch>
```

Pushing the task branch is pre-authorized. Merging into `main` is not —
stop and report.

## Quality bar

Write for a stranger on a different model.

- Name files and symbols. "The helper" means nothing next month.
- Record _why_; the _what_ is already in `git log`.
- Absolute dates, never "yesterday".
- Short. Memory nobody reads is memory that does not exist.

## Sanity check

Ask yourself: if I opened this repository right now with no memory of this
conversation, could I resume from `AGENTS.md`, `PROJECT_STATE.md`,
`DECISIONS.md`, the newest session file, `task-checklist.md`, and
`git log --oneline -20`?

If the answer is no, the handoff is not finished.
