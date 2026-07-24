/**
 * Tile sizing math.
 *
 * Kept separate from the DOM so that every size decision is a pure
 * function of measured numbers. Measurement happens once per interaction —
 * never inside a pointer-move handler, which would force a reflow on every
 * mouse event.
 *
 * The maximum is a fraction of the space available: the tile is a card on
 * a page and must not fill it edge to edge. The minimum is not a fraction
 * of anything. It is whatever the animation inside needs, plus the chrome
 * around it, which is why it is measured rather than assumed — a figure
 * that states it wants 560×320 gets a tile that cannot be dragged smaller
 * than that.
 */

import { clamp } from '../utils/math.js';

export const MAX_SIZE_RATIO = 0.95;
export const INITIAL_SIZE_RATIO = 0.7;
export const SNAP_TOLERANCE_PX = 1;

/**
 * Floor under the adaptive minimum, in stage pixels.
 *
 * With no model to speak for itself the tile still has to be usable: the
 * toolbar needs its controls side by side and the empty state needs room
 * for its two lines.
 */
export const FLOOR_STAGE = { width: 260, height: 170 };

/**
 * Measure everything a sizing decision depends on, in one layout read.
 *
 * This is the only place in the shell that touches layout. Call it on
 * pointer-down, on preset selection, on window resize, and when the model
 * changes — not per frame and not per pointer move.
 *
 * @param {HTMLElement} tile - Tile element.
 * @param {HTMLElement} body - The tile's body; everything else is chrome.
 * @returns {{
 *   bounds: { width: number, height: number },
 *   chrome: { width: number, height: number },
 * }} Available space, and what the tile costs around its stage.
 */
export function measureFrame(tile, body) {
  return {
    bounds: measureBounds(tile),
    chrome: measureChrome(tile, body),
  };
}

/**
 * Resolve the size range the tile may be dragged through.
 *
 * The minimum is capped by the maximum on purpose: on a small screen a
 * demanding model cannot be honoured, and a tile larger than the page is
 * worse than a cramped one.
 *
 * @param {{ bounds: object, chrome: object }} frame - From `measureFrame`.
 * @param {{ width: number, height: number }} stageMin - Stage the mounted
 *   model needs, in pixels. Zeros mean "no model has an opinion".
 * @returns {{
 *   bounds: { width: number, height: number },
 *   min: { width: number, height: number },
 *   max: { width: number, height: number },
 * }} The resolved limits, in tile pixels.
 */
export function resolveLimits({ bounds, chrome }, stageMin) {
  const max = {
    width: bounds.width * MAX_SIZE_RATIO,
    height: bounds.height * MAX_SIZE_RATIO,
  };
  const required = {
    width: Math.max(stageMin.width, FLOOR_STAGE.width) + chrome.width,
    height:
      Math.max(stageMin.height, FLOOR_STAGE.height) + chrome.height,
  };

  return {
    bounds,
    max,
    min: {
      width: Math.min(required.width, max.width),
      height: Math.min(required.height, max.height),
    },
  };
}

/**
 * Size for a given fraction of the available bounds, clamped to the limits.
 * @param {object} limits - From `resolveLimits`.
 * @param {number} ratio - Fraction of the bounds, 0-1.
 * @returns {{ width: number, height: number }} Target size in pixels.
 */
export function sizeForRatio(limits, ratio) {
  return clampSize(
    limits,
    limits.bounds.width * ratio,
    limits.bounds.height * ratio,
  );
}

/**
 * Clamp an arbitrary size into the allowed range.
 * @param {object} limits - From `resolveLimits`.
 * @param {number} width - Desired width in pixels.
 * @param {number} height - Desired height in pixels.
 * @returns {{ width: number, height: number }} Clamped size in pixels.
 */
export function clampSize(limits, width, height) {
  return {
    width: clamp(width, limits.min.width, limits.max.width),
    height: clamp(height, limits.min.height, limits.max.height),
  };
}

/**
 * Check whether a size already matches a target.
 * @param {{ width: number, height: number }} size - Current size.
 * @param {{ width: number, height: number }} target - Size to compare to.
 * @returns {boolean} True when moving there would change nothing.
 */
export function matchesSize(size, target) {
  return (
    Math.abs(size.width - target.width) < SNAP_TOLERANCE_PX
    && Math.abs(size.height - target.height) < SNAP_TOLERANCE_PX
  );
}

function measureBounds(tile) {
  const parent = tile.parentElement;

  if (parent === null) {
    return { width: window.innerWidth, height: window.innerHeight };
  }

  const style = window.getComputedStyle(parent);
  const paddingX =
    parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  const paddingY =
    parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);

  return {
    width: parent.clientWidth - paddingX,
    height: parent.clientHeight - paddingY,
  };
}

/**
 * What the tile costs on top of its stage: borders, and the toolbar strip.
 *
 * Measured rather than read from a token, because the toolbar's height is
 * set in `rem` and the user's root font size is theirs to choose.
 *
 * A body with no box yet is not a tile with enormous chrome — it is a
 * measurement taken before layout. Reporting zero is the honest answer;
 * inventing a number would silently pin the minimum size to the maximum.
 */
function measureChrome(tile, body) {
  if (body.offsetWidth === 0 || body.offsetHeight === 0) {
    return { width: 0, height: 0 };
  }

  return {
    width: Math.max(0, tile.offsetWidth - body.offsetWidth),
    height: Math.max(0, tile.offsetHeight - body.offsetHeight),
  };
}
