/**
 * Second-order spring.
 *
 * Every value that would otherwise jump goes through one of these, which is
 * why nothing in a scene ever changes instantly. Fields are public and
 * plain on purpose: this runs for every animated property of every entity,
 * every frame, and accessors would add call overhead to the hottest path in
 * the project.
 */

const MAX_SUBSTEPS = 8;
const SUBSTEP_SECONDS = 0.008;

export class Spring {
  /**
   * @param {number} value - Initial and target value.
   * @param {number} stiffness - Higher is snappier.
   * @param {number} damping - `1` settles without overshoot; below `1`
   *   overshoots and comes back, which reads as weight.
   */
  constructor(value, stiffness = 90, damping = 1) {
    this.value = value;
    this.target = value;
    this.velocity = 0;
    this.stiffness = stiffness;
    this.damping = 2 * Math.sqrt(stiffness) * damping;
  }

  /**
   * Jump to a value with no motion. For initialisation, not for animation.
   * @param {number} value - New value and target.
   */
  set(value) {
    this.value = value;
    this.target = value;
    this.velocity = 0;
  }

  /**
   * Kick the spring without moving its target. Produces a decaying wobble.
   * @param {number} velocity - Impulse strength.
   */
  impulse(velocity) {
    this.value = this.target;
    this.velocity = velocity;
  }

  /**
   * Advance towards the target.
   *
   * Substepped, so a long frame after a stalled tab cannot make the
   * integration explode.
   *
   * @param {number} dt - Seconds since the previous step.
   * @returns {number} The new value.
   */
  step(dt) {
    const steps =
      Math.min(MAX_SUBSTEPS, Math.ceil(dt / SUBSTEP_SECONDS)) || 1;
    const h = dt / steps;

    for (let i = 0; i < steps; i += 1) {
      const acceleration =
        this.stiffness * (this.target - this.value)
        - this.damping * this.velocity;

      this.velocity += acceleration * h;
      this.value += this.velocity * h;
    }

    return this.value;
  }
}
