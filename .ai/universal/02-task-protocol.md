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
