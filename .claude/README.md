# Claude Code Project Configuration

Project-scoped Claude Code configuration for animation-js.

Durable rules live in the shared modules under `.ai/` (universal + project).
`CLAUDE.md` imports them natively via `@` syntax. Every other assistant
consumes the same modules through generated entry points — regenerate with
`npm run ai:sync`, never edit them by hand. Subagents should read
`AGENTS.md`; it is the compiled single-file ruleset.

## Files

- `settings.json` — permission allowlist for routine work, and an explicit
  denylist for destructive git operations and for `docs/__arch__/`.
- `launch.json` — dev-server target for the `preview_*` tools.
- `agents/` — project-scoped subagents; name-for-name mirror of
  `.codex/agents/`.
- `skills/` — reusable project workflows; mirror of `.codex/skills/`.

## Delegation map

Do task-owning work on the main thread. Spawn a subagent only for
independent work that does not need the main thread's full context.

| Agent                  | Use for                                              |
| ---------------------- | ---------------------------------------------------- |
| `anim-engine`          | `src/core/` — ticker, reactive, DOM batching, Scene  |
| `anim-scene-builder`   | `src/scenes/` — characters, rigs, motion             |
| `anim-shell-ux`        | `src/shell/` + `src/styles/` — chrome, theme, UX     |
| `anim-perf-auditor`    | Frame-budget review of a scene or a hot path         |
| `anim-code-reviewer`   | Reviewing a diff in a fresh context before finishing |
| `anim-repo-maintainer` | Tooling, CI, hooks, rule-module upkeep               |

## Quality shortcuts

```bash
npm run dev
npm run validate
npm run format
npm run ai:sync
```

## Standing reminders

- `docs/__arch__/` is owner-private and denied in `settings.json`.
- Pushing the task branch is pre-authorized; merging into `main` is not.
- Documentation and tests are written only on explicit request.
