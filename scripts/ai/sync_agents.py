"""Assemble every AI-assistant entry point from the shared `.ai/` modules.

Claude Code reads `CLAUDE.md`, which imports the modules natively with `@`
syntax. Every other assistant needs a single flat file, so this script
concatenates the same modules into one file per vendor. That is what keeps
all of them on one identical ruleset.

Usage:
    python scripts/ai/sync_agents.py            # write every target
    python scripts/ai/sync_agents.py --check    # fail if a target drifted
"""

from __future__ import annotations

import argparse
import sys
from dataclasses import dataclass
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
MODULES_DIR = ROOT_DIR / ".ai"
MODULE_GROUPS = ("universal", "project")

PROJECT_NAME = "animation-js"
PROJECT_TAGLINE = (
    "Zero-dependency animation playground built with vanilla JavaScript, "
    "CSS, and HTML."
)

SYNC_COMMAND = "npm run ai:sync"

INTRO = f"""\
This file is the shared ruleset for {PROJECT_NAME}: {PROJECT_TAGLINE}

It is assembled from the rule modules in `.ai/` so that every AI assistant
working on this repository follows identical rules. Later sections override
earlier ones; an explicit owner instruction in the current conversation
overrides everything.

Start of every session: read `.ai/memory/PROJECT_STATE.md`,
`.ai/memory/DECISIONS.md`, and the newest files in `.ai/memory/sessions/`.
End of every session: update them.

## Non-negotiables, in case you read nothing else

1. `docs/__arch__/` is owner-private. Do not read, list, edit, or delete
   anything in it without an explicit request in this conversation.
2. Never delete `main`, never force-push to it, and never merge into it
   without an explicit owner instruction. Pushing a task branch is fine.
3. No documentation and no tests unless the owner asked. The default task
   is product logic: the engine, the scenes, the motion.
4. `public/index.html` references exactly one CSS file and one JS module.
5. `src/shell/` and `src/scenes/` never import each other.
6. Animate `transform` and `opacity` only; one shared rAF loop; motion
   scaled by `dt`; nothing allocated inside a frame.
7. State goes through `reactive()` (`new Proxy`), never a manual redraw —
   except per-entity simulation state, which stays in plain objects.
8. `AGENTS.md` and the other entry points are generated. Edit `.ai/`, then
   run `npm run ai:sync`.\
"""

# Codex reads at most `project_doc_max_bytes` of project instructions,
# which defaults to 32 KiB. `.codex/config.toml` raises it, and the
# non-negotiables above survive a truncated read on a default setup.
MAX_TARGET_KIB = 40.0


@dataclass(frozen=True)
class Target:
    """One generated entry point."""

    path: Path
    assistant: str
    preamble: str = ""

    def render(self, modules: list[Path]) -> str:
        banner = (
            "<!--\n"
            "GENERATED FILE - DO NOT EDIT.\n"
            "Source of truth: .ai/universal/*.md and .ai/project/*.md.\n"
            f"Edit a module, then run: {SYNC_COMMAND}\n"
            "-->\n"
        )
        heading = f"# {PROJECT_NAME} - shared ruleset for {self.assistant}\n"
        parts = [f"{self.preamble}{banner}\n{heading}\n{INTRO}"]
        for module in modules:
            rel = module.relative_to(ROOT_DIR).as_posix()
            body = module.read_text(encoding="utf-8").strip()
            parts.append(f"<!-- module: {rel} -->\n\n{body}")
        return "\n\n---\n\n".join(parts) + "\n"


CURSOR_PREAMBLE = (
    "---\n"
    f"description: {PROJECT_NAME} - shared rules for every AI assistant\n"
    "globs:\n"
    "alwaysApply: true\n"
    "---\n\n"
)

TARGETS: tuple[Target, ...] = (
    Target(ROOT_DIR / "AGENTS.md", "Codex and any AGENTS.md-aware agent"),
    Target(
        ROOT_DIR / ".github" / "copilot-instructions.md",
        "GitHub Copilot",
    ),
    Target(ROOT_DIR / "GEMINI.md", "Gemini"),
    Target(
        ROOT_DIR / ".cursor" / "rules" / "animation-js.mdc",
        "Cursor",
        preamble=CURSOR_PREAMBLE,
    ),
)


def module_files() -> list[Path]:
    """Collect rule modules in load order: universal first, then project."""
    files: list[Path] = []
    for group in MODULE_GROUPS:
        group_dir = MODULES_DIR / group
        if not group_dir.is_dir():
            fail(f"missing module directory: {group_dir}")
        files.extend(sorted(group_dir.glob("*.md")))
    if not files:
        fail("no rule modules found under .ai/")
    return files


def fail(message: str) -> None:
    """Abort with a non-zero exit code and a readable reason."""
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(2)


def kib(content: str) -> float:
    return len(content.encode("utf-8")) / 1024


def check(modules: list[Path]) -> int:
    drifted: list[str] = []
    for target in TARGETS:
        expected = target.render(modules)
        current = (
            target.path.read_text(encoding="utf-8")
            if target.path.exists()
            else ""
        )
        if current != expected:
            drifted.append(target.path.relative_to(ROOT_DIR).as_posix())

    if drifted:
        print(
            "Assistant entry points are out of sync with .ai/ modules:\n  "
            + "\n  ".join(drifted)
            + f"\nRun: {SYNC_COMMAND}",
            file=sys.stderr,
        )
        return 1

    print(f"All {len(TARGETS)} assistant entry points are in sync.")
    return 0


def write(modules: list[Path]) -> int:
    written = 0
    for target in TARGETS:
        content = target.render(modules)
        size = kib(content)
        if size > MAX_TARGET_KIB:
            fail(
                f"{target.path.name} would be {size:.1f} KiB; the practical "
                f"limit is {MAX_TARGET_KIB:.0f} KiB. Trim the modules."
            )
        current = (
            target.path.read_text(encoding="utf-8")
            if target.path.exists()
            else ""
        )
        if current == content:
            continue
        target.path.parent.mkdir(parents=True, exist_ok=True)
        target.path.write_text(content, encoding="utf-8", newline="\n")
        written += 1
        rel = target.path.relative_to(ROOT_DIR).as_posix()
        print(f"wrote {rel} ({size:.1f} KiB)")

    if written == 0:
        print(f"All {len(TARGETS)} assistant entry points already up to date.")
    else:
        print(f"Regenerated {written} of {len(TARGETS)} entry points "
              f"from {len(modules)} modules.")
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Assemble AI assistant entry points from .ai/ modules."
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="verify the generated files match the modules; do not write",
    )
    args = parser.parse_args(argv)

    modules = module_files()
    return check(modules) if args.check else write(modules)


if __name__ == "__main__":
    raise SystemExit(main())
