# Scope Control and Code Style

Change only what the task requires; keep code readable without decoration.

## Minimal changes

Touch only what the task needs. Forbidden without necessity:
mass-reformatting unrelated files, renaming outside the task,
restructuring architecture "while at it", rewriting working code without
cause, deleting functionality without a direct requirement.

Discovered an unrelated problem? Record it in the final report and in
`.ai/memory/` — do not mix it into the diff.

## Documentation is opt-in

- Do NOT write or restyle documentation (`README`, `*.md`, `*.txt`,
  changelogs) unless the owner asked for it in the current task.
- Exception: the governance files themselves (`.ai/`, `CLAUDE.md`,
  generated agent entry points, `.ai/memory/`). Those are infrastructure
  and must always be accurate.
- If an existing doc becomes factually wrong because of your change, the
  minimal correction is allowed. A rewrite is not.

## Tests are opt-in

- Do NOT write, scaffold, or expand automated tests unless the owner asked
  in the current task.
- Verification still happens — by running the thing and looking at it (see
  the verification module).
- Never delete or weaken an existing test to make something pass.
- When tests are requested, write real ones: happy path, edge cases, and a
  regression case for any bug being fixed.

## What the default task actually is

Product logic. Here that means the animation engine, scenes, characters,
motion, and the interface hosting them. Infrastructure, tooling, docs, and
tests are supporting work, done on request.

## Comments

- No comments unless genuinely necessary. Structure and naming carry the
  meaning.
- A comment is allowed only when important logic stays non-obvious even
  with good naming, and must explain the non-obvious _why_, never restate
  the code.
- Stale, false, or misleading comments are forbidden. No docstrings that
  repeat a function name. Match the surrounding file's comment density.

## File size

- Code files under ~400 lines; split by meaning when approaching it.
- Entry-point files under ~50 lines. They wire modules and nothing else.
- A file needing a table of contents to navigate is already too big.
