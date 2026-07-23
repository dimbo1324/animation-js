# Verification: Prove It Works

"It should work" is not a result. Every task ends with evidence.

## The verification ladder

Automated tests are opt-in here, so verification leans on the other rungs.
Use the highest rung the task allows:

1. **Static gate** — formatter, linters, generated-rules sync check.
   Always run. Non-negotiable.
2. **Run it** — start the dev server, load the page, exercise what
   changed, look at the console. An empty console is part of the result.
3. **Observe the motion** — watch anything animated. Smooth, not drifting
   with frame rate, stops when it should, survives a resize and a tab
   switch.
4. **Measure** — when a change could plausibly cost frames, look at frame
   timing before claiming it is fine.
5. **Automated tests** — when the owner asked for them.

## Errors and logging

- Handle errors explicitly. Forbidden: silently swallowed errors, empty
  `catch` blocks, debug logging left behind.
- `console.log` used for debugging is removed before the final commit.
  Intentional permanent diagnostics must look intentional.
- An error message says what broke, where, and with what context.

## Cleanup obligations

Anything that starts must be able to stop. Every task adding a loop,
listener, observer, or timer also adds the code that tears it down, and
must answer "what happens when this is unmounted twice?".

Leaked listeners and orphaned animation frames are correctness bugs, not
style issues.

## Honest reporting

State the command you ran and its actual outcome. If a check was skipped,
say so and why. Never describe an intended check in the past tense.
