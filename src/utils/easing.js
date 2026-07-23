/**
 * Easing functions.
 *
 * Each takes normalised progress `t` in 0-1 and returns eased progress.
 * Choose by physical metaphor, not by taste: ease-out for things arriving,
 * ease-in for things leaving, back and elastic for things with mass.
 */

/**
 * No easing. Useful as an explicit default.
 * @param {number} t - Progress 0-1.
 * @returns {number} The same progress.
 */
export function linear(t) {
  return t;
}

/**
 * Accelerating from zero. Good for exits.
 * @param {number} t - Progress 0-1.
 * @returns {number} Eased progress.
 */
export function easeInCubic(t) {
  return t * t * t;
}

/**
 * Decelerating to zero. Good for entrances.
 * @param {number} t - Progress 0-1.
 * @returns {number} Eased progress.
 */
export function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

/**
 * Symmetric acceleration then deceleration. The safe general-purpose curve.
 * @param {number} t - Progress 0-1.
 * @returns {number} Eased progress.
 */
export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/**
 * Sine ease-in-out. Gentler than cubic; good for idle loops and breathing.
 * @param {number} t - Progress 0-1.
 * @returns {number} Eased progress.
 */
export function easeInOutSine(t) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

/**
 * Overshoots the target, then settles. Reads as anticipation.
 * @param {number} t - Progress 0-1.
 * @returns {number} Eased progress, may exceed 1 mid-curve.
 */
export function easeOutBack(t) {
  const overshoot = 1.70158;

  return 1 + (overshoot + 1) * (t - 1) ** 3 + overshoot * (t - 1) ** 2;
}

/**
 * Decaying bounce. For things landing on a surface.
 * @param {number} t - Progress 0-1.
 * @returns {number} Eased progress.
 */
export function easeOutBounce(t) {
  const n = 7.5625;
  const d = 2.75;

  if (t < 1 / d) {
    return n * t * t;
  }

  if (t < 2 / d) {
    const shifted = t - 1.5 / d;

    return n * shifted * shifted + 0.75;
  }

  if (t < 2.5 / d) {
    const shifted = t - 2.25 / d;

    return n * shifted * shifted + 0.9375;
  }

  const shifted = t - 2.625 / d;

  return n * shifted * shifted + 0.984375;
}
