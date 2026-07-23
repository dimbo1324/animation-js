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
