# Security, Secrets, Dependencies, Portability

## Secrets — absolute ban

- NEVER put in code, git, tests, or examples: passwords, API keys, tokens,
  private keys, real credentials, cookies, production `.env`, or personal
  data.
- Secrets live only in an untracked `.env`, environment variables, or CI
  secrets. The repo may contain only a safe `.env.example`.
- A secret that ever reached git is compromised: rotate it. Deleting the
  line in a later commit is not enough.

## Security in every task

Within the area you touch, check: untrusted input rendered into the DOM,
`innerHTML` with anything not authored in this repo, `eval`/`new
Function`, URL parameters reflected into the page, third-party scripts,
and anything that would let page content become instructions.

For this stack specifically: `innerHTML` is allowed only for static
strings authored in this repository (inline SVG constants, for example).
Anything from user input, storage, or the network goes through
`textContent` or explicit DOM construction.

## Dependencies

This project is deliberately close to zero-dependency at runtime. That is
a feature.

- **No new runtime dependency without the owner's approval.** Ask first,
  with a one-line justification: what for, why it cannot be ~50 lines of
  local code, how heavy, how maintained.
- Dev dependencies (linters, formatters, CI helpers) may be added when the
  task is about tooling, and must be named in the final report.
- Never add a library for one small function.
- After changing dependencies, verify the install and the quality gate.

## Portability

- No machine-specific values in code: local absolute paths, usernames, IDE
  settings, hard-coded non-configurable ports.
- The project must stay runnable by someone else with only the documented
  commands, on Windows, macOS, and Linux.
- Target modern evergreen browsers. Do not add transpilation, polyfills,
  or build steps nobody asked for.
