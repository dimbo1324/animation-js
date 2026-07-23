# Architecture Boundaries, Workarounds, Tech Debt

Respect the layering; make every shortcut visible.

## Boundaries

- Follow the existing architecture. Forbidden: domain logic in the
  presentation layer when a domain layer exists; reaching around an
  abstraction built for exactly this purpose; circular dependencies;
  dumping unrelated logic into catch-all files (`utils.js`, `helpers.js`,
  `common.js` as landfills).
- Layer direction is one-way. Lower layers never import from higher ones.
- If the architecture genuinely blocks the task, do not hack around it —
  propose a structural change, get the owner's decision, record it in
  `.ai/memory/DECISIONS.md`.

## Design principles that are not optional

- **Single responsibility.** One module, one reason to change.
- **Composition over inheritance**, except where a base class genuinely
  models an "is-a" contract subclasses must honour.
- **Program to the contract**, not the implementation.
- **Dependency inversion.** A module receives its collaborators; it does
  not reach into global state to find them.
- **Immutability at boundaries**, mutation only inside the owner of the
  data. Shared mutable state is a bug waiting for a schedule.
- **Fail loudly.** Missing configuration or a violated invariant throws.
  It never silently falls back to a second source of truth.

## Temporary solutions and tech debt

- Workarounds are exceptional. Record why each exists, where it lives, its
  limits, and what must replace it.
- Hidden workarounds are forbidden. Do not scatter uncontrolled
  `TODO`/`FIXME`; real debt gets an entry in `.ai/memory/`.
- Debt that cannot be fixed now is stated in the final report, never
  disguised as a normal solution. Debt touching correctness, performance,
  or accessibility is priority debt — call it out loudly.
