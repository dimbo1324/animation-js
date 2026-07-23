## What changed

<!-- One or two sentences. What, and why. -->

## Area

- [ ] `src/core/` — engine
- [ ] `src/shell/` — frame, theme, chrome
- [ ] `src/scenes/` — an animation
- [ ] tooling / infrastructure

## Performance doctrine

- [ ] Frame path writes only `transform` and `opacity`
- [ ] No DOM reads after DOM writes in the same frame
- [ ] No allocation inside `onUpdate` / `onRender`
- [ ] Motion is time-based (`speed * dt`)
- [ ] Everything created in `onMount` is released in `onDestroy`

## Verification

<!-- Commands actually run and their actual results. What was checked in
     the browser, and what was not. -->

- [ ] `npm run validate` is green
- [ ] Watched in the browser: smooth, survives resize and tab switch
- [ ] Console is clean

## Not done

<!-- Honest list. An empty section is suspicious. -->
