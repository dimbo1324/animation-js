/**
 * Utility helper functions
 */

/**
 * Clamp a value between min and max
 * @param {number} value - The value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Interpolate between two values
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} t - Progress (0-1)
 * @returns {number} Interpolated value
 */
export function lerp(start, end, t) {
  return start + (end - start) * t;
}

/**
 * Normalize a value to 0-1 range
 * @param {number} value - The value to normalize
 * @param {number} min - Minimum value of range
 * @param {number} max - Maximum value of range
 * @returns {number} Normalized value (0-1)
 */
export function normalize(value, min, max) {
  return (value - min) / (max - min);
}

/**
 * Ease-in-out cubic function
 * @param {number} t - Progress (0-1)
 * @returns {number} Eased progress
 */
export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
