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
