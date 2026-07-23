# Cross-Session Memory

This directory is the project's long-term memory. It exists so that losing a
chat costs nothing.

| File / dir         | Tense   | Purpose                                        |
| ------------------ | ------- | ---------------------------------------------- |
| `PROJECT_STATE.md` | present | What exists right now and how it is shaped     |
| `DECISIONS.md`     | perfect | Choices that constrain the future. Append-only |
| `sessions/`        | past    | One artifact per task. Narrative and handoff   |

Rules:

- `PROJECT_STATE.md` is rewritten in place. It never accumulates history.
- `DECISIONS.md` is append-only. Supersede, never edit or delete.
- `sessions/` files are immutable once the task ends.
- Everything here is written in English.
- Everything here is written for a stranger.

See `.ai/project/16-continuity.md` for the full protocol.
