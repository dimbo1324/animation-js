/**
 * Pure numeric helpers for animation math.
 *
 * Every function here is allocation-free and safe to call inside a frame
 * loop.
 */

/**
 * Constrain a value to a range.
 * @param {number} value - Value to clamp.
 * @param {number} min - Lower bound.
 * @param {number} max - Upper bound.
 * @returns {number} Clamped value.
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Interpolate linearly between two values.
 * @param {number} start - Value at `t = 0`.
 * @param {number} end - Value at `t = 1`.
 * @param {number} t - Progress, normally 0-1.
 * @returns {number} Interpolated value.
 */
export function lerp(start, end, t) {
  return start + (end - start) * t;
}

/**
 * Map a value from a range to 0-1.
 * @param {number} value - Value to normalise.
 * @param {number} min - Range minimum.
 * @param {number} max - Range maximum.
 * @returns {number} Normalised value.
 */
export function normalize(value, min, max) {
  return (value - min) / (max - min);
}

/**
 * Remap a value from one range to another.
 * @param {number} value - Value to remap.
 * @param {number} inMin - Source range minimum.
 * @param {number} inMax - Source range maximum.
 * @param {number} outMin - Target range minimum.
 * @param {number} outMax - Target range maximum.
 * @returns {number} Remapped value.
 */
export function remap(value, inMin, inMax, outMin, outMax) {
  return lerp(outMin, outMax, normalize(value, inMin, inMax));
}

/**
 * Frame-rate independent exponential smoothing.
 *
 * Prefer this over `lerp(current, target, 0.1)` in a frame loop: plain
 * lerp with a constant factor moves twice as fast at 120 Hz as at 60 Hz.
 *
 * @param {number} current - Current value.
 * @param {number} target - Value being approached.
 * @param {number} smoothing - Fraction remaining after one second, 0-1.
 *   Smaller is snappier.
 * @param {number} dt - Seconds since the previous update.
 * @returns {number} Smoothed value.
 */
export function damp(current, target, smoothing, dt) {
  return lerp(target, current, smoothing ** dt);
}

/**
 * Wrap a value into a half-open range.
 * @param {number} value - Value to wrap.
 * @param {number} min - Range minimum, inclusive.
 * @param {number} max - Range maximum, exclusive.
 * @returns {number} Wrapped value.
 */
export function wrap(value, min, max) {
  const span = max - min;

  return min + ((((value - min) % span) + span) % span);
}

/**
 * Random float in a range.
 * @param {number} min - Lower bound, inclusive.
 * @param {number} max - Upper bound, exclusive.
 * @returns {number} Random value.
 */
export function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}
