---
name: code-review
description: Use for reviewing animation-js diffs, branches, or uncommitted changes before finishing a task or opening a pull request.
---

# Code Review Workflow

Review like an owner. Findings first, summary last.

## Focus, in order of severity

1. **Guardrail violations** — anything touching `docs/__arch__/`; a third
   asset reference in `public/index.html`; `shell` importing `scenes` or
   the reverse; a hand-edited generated file (`AGENTS.md`,
   `copilot-instructions.md`, `GEMINI.md`, the Cursor rule); a new runtime
   dependency; documentation or tests nobody asked for.
2. **Correctness** — lifecycle order, state surviving an unmount, teardown
   that is not idempotent, behaviour regressions.
3. **Performance doctrine** — layout thrash, non-compositor properties in a
   frame path, allocation per frame, a second `requestAnimationFrame` loop,
   frame-rate-dependent motion.
4. **Reactivity doctrine** — missing equality guard, synchronous flush,
   proxies on hot per-entity state, dropped effect disposers.
5. **Craft** — decomposition, naming, dead code, stray `console.log`,
   comments restating code, files past ~400 lines, entry points past ~50,
   raw values bypassing design tokens.
6. **Accessibility** — keyboard reachability, focus visibility, ARIA on
   custom widgets, contrast in both themes, `prefers-reduced-motion`.
7. **Scope** — anything in the diff the task did not ask for.
8. **Memory duties** — `.ai/memory/` updated, `task-checklist.md` filled
   honestly, `npm run ai:sync` run if `.ai/` changed.

## Output

Findings ordered by severity, each with `file:line`, the concrete failure it
causes, and the fix. Keep the summary short and last. If nothing is wrong,
say so plainly and name the residual risk or the gap you could not check.

For a larger or higher-stakes diff, delegate to the `anim-code-reviewer`
agent instead of reviewing inline — it runs in a fresh context and is not
anchored on the reasoning that produced the change.
