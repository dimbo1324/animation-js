/**
 * Tile sizing math.
 *
 * Kept separate from the DOM so that every size decision is a pure
 * function of measured bounds. Measurement happens once per interaction —
 * never inside a pointer-move handler, which would force a reflow on every
 * mouse event.
 */

import { clamp } from '../utils/math.js';

export const MIN_SIZE_RATIO = 0.5;
export const MAX_SIZE_RATIO = 0.95;
export const INITIAL_SIZE_RATIO = 0.7;
export const SNAP_TOLERANCE_PX = 1;

/**
 * Measure the area available to the tile.
 *
 * This is a layout read. Call it on pointer-down, on preset selection, and
 * on window resize — not per frame and not per pointer move.
 *
 * @param {HTMLElement} tile - Tile element.
 * @returns {{ width: number, height: number }} Available bounds in pixels.
 */
export function measureBounds(tile) {
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
 * Size for a given fraction of the available bounds, clamped to the limits.
 * @param {{ width: number, height: number }} bounds - Available bounds.
 * @param {number} ratio - Fraction of the bounds, 0-1.
 * @returns {{ width: number, height: number }} Target size in pixels.
 */
export function sizeForRatio(bounds, ratio) {
  return clampSize(bounds, bounds.width * ratio, bounds.height * ratio);
}

/**
 * Clamp an arbitrary size into the allowed range for the given bounds.
 * @param {{ width: number, height: number }} bounds - Available bounds.
 * @param {number} width - Desired width in pixels.
 * @param {number} height - Desired height in pixels.
 * @returns {{ width: number, height: number }} Clamped size in pixels.
 */
export function clampSize(bounds, width, height) {
  return {
    width: clamp(
      width,
      bounds.width * MIN_SIZE_RATIO,
      bounds.width * MAX_SIZE_RATIO,
    ),
    height: clamp(
      height,
      bounds.height * MIN_SIZE_RATIO,
      bounds.height * MAX_SIZE_RATIO,
    ),
  };
}

/**
 * Check whether a size already matches a preset ratio.
 * @param {{ width: number, height: number }} bounds - Available bounds.
 * @param {{ width: number, height: number }} size - Current size.
 * @param {number} ratio - Preset ratio to compare against.
 * @returns {boolean} True when the preset would change nothing.
 */
export function matchesRatio(bounds, size, ratio) {
  const target = sizeForRatio(bounds, ratio);

  return (
    Math.abs(size.width - target.width) < SNAP_TOLERANCE_PX
    && Math.abs(size.height - target.height) < SNAP_TOLERANCE_PX
  );
}
