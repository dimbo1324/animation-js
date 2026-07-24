/**
 * The one owner of the tile's size.
 *
 * Every widget that can resize the tile — the drag handles, the preset
 * menu, the page itself — goes through here, so there is exactly one place
 * that measures layout and exactly one place that decides what a requested
 * size is allowed to become.
 *
 * The space available is watched with a `ResizeObserver` rather than a
 * `window` resize listener. The observer fires once when it starts, after
 * layout has actually happened, which is the only moment the first
 * measurement is worth taking: reading sizes straight after appending the
 * tile returns whatever the page looked like before its stylesheets
 * settled, and a wrong reading there poisons every limit derived from it.
 *
 * Limits are cached. They change when the page changes size and when the
 * model announces a different appetite — both events, not frames.
 * Recomputing them inside a drag would put a layout read on every pointer
 * move.
 */

import { effect, read } from '../core/index.js';
import {
  INITIAL_SIZE_RATIO,
  clampSize,
  measureFrame,
  resolveLimits,
  sizeForRatio,
} from './geometry.js';
import { setSize, shellState, sizeLocked } from './state.js';

/**
 * Create the sizing controller for a tile.
 * @param {HTMLElement} tile - The tile element.
 * @param {HTMLElement} body - The tile's body; everything else is chrome.
 * @returns {object} Controller. Call `activate()` once the tile is in the
 *   document, and `dispose()` on teardown.
 */
export function createSizing(tile, body) {
  let limits = null;
  let started = false;
  let observer = null;

  function refresh() {
    limits = resolveLimits(
      measureFrame(tile, body),
      shellState.stageMin,
    );

    return limits;
  }

  function currentLimits() {
    return limits ?? refresh();
  }

  function current() {
    return { width: shellState.width, height: shellState.height };
  }

  function apply(width, height) {
    setSize(clampSize(currentLimits(), width, height));
  }

  /**
   * Re-measure and pull the tile back inside the new limits.
   *
   * Deliberately not guarded by the lock: a page that shrinks while the
   * animation runs must still pull the tile in after it. The lock is about
   * the user resizing, not about the tile outgrowing its page.
   *
   * The first run is different — there is no size to preserve yet, so it
   * takes the starting one.
   */
  function reconcile() {
    read(() => {
      refresh();

      if (started) {
        apply(shellState.width, shellState.height);

        return;
      }

      started = true;
      setSize(sizeForRatio(limits, INITIAL_SIZE_RATIO));
    });
  }

  // A model with a bigger appetite than the current tile makes the tile
  // grow to meet it. This is the direction the owner asked for: the figure
  // states its size and the frame adapts, rather than the figure being
  // squeezed into whatever the frame happens to be.
  const stopStageMinEffect = effect(() => {
    void shellState.stageMin;

    reconcile();
  });

  return {
    /** @returns {object} Cached limits, measured if they are missing. */
    get limits() {
      return currentLimits();
    },

    /** Re-measure. Call before an interaction, not during one. */
    refresh,

    /** @returns {{ width: number, height: number }} The current size. */
    current,

    /**
     * Resize the tile, clamped to the current limits.
     * @param {number} width - Desired width in pixels.
     * @param {number} height - Desired height in pixels.
     */
    resize(width, height) {
      if (sizeLocked.value) {
        return;
      }

      apply(width, height);
    },

    /**
     * Size the tile to one end of the resolved range.
     * @param {'min' | 'max'} edge - Which end.
     */
    applyEdge(edge) {
      if (sizeLocked.value) {
        return;
      }

      const target = refresh()[edge];

      setSize({ width: target.width, height: target.height });
    },

    /** Start watching the available space. The tile must be in the DOM. */
    activate() {
      observer = new ResizeObserver(reconcile);
      observer.observe(tile.parentElement ?? document.body);
    },

    dispose() {
      observer?.disconnect();
      observer = null;
      stopStageMinEffect();
    },
  };
}
