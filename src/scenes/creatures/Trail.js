/**
 * The leader's path history.
 *
 * Followers do not chase the leader — they replay where it was, a fixed
 * number of seconds ago. That is what produces a proper single-file chain:
 * every creature traces the identical path, including the turnarounds,
 * without any steering logic.
 *
 * Backed by typed arrays and written in a ring, so a scene running for an
 * hour allocates exactly as much as one running for a second.
 */

export class Trail {
  #time;
  #x;
  #direction;
  #capacity;
  #head = -1;
  #count = 0;

  /**
   * @param {number} capacity - Samples to keep. Must cover the longest
   *   follower delay at the lowest expected frame rate.
   */
  constructor(capacity) {
    this.#capacity = capacity;
    this.#time = new Float64Array(capacity);
    this.#x = new Float32Array(capacity);
    this.#direction = new Int8Array(capacity);
  }

  /**
   * Record where the leader is now.
   * @param {number} time - Scene time in seconds, monotonically increasing.
   * @param {number} x - Leader position.
   * @param {number} direction - `1` or `-1`.
   */
  push(time, x, direction) {
    this.#head = (this.#head + 1) % this.#capacity;
    this.#time[this.#head] = time;
    this.#x[this.#head] = x;
    this.#direction[this.#head] = direction;

    if (this.#count < this.#capacity) {
      this.#count += 1;
    }
  }

  /** Forget everything. Used on resize, when the path itself changed. */
  clear() {
    this.#head = -1;
    this.#count = 0;
  }

  /**
   * Read the leader's state at an earlier moment.
   *
   * Walks back from the newest sample, which is the direction the answer
   * always lies in, and interpolates between the two bracketing samples so
   * the follower does not step at the recording rate.
   *
   * @param {number} time - Scene time to look up.
   * @param {{ x: number, direction: number }} out - Mutated in place, so
   *   sampling costs no allocation.
   * @returns {boolean} False when the trail is not deep enough yet.
   */
  sample(time, out) {
    if (this.#count === 0) {
      return false;
    }

    for (let step = 0; step < this.#count - 1; step += 1) {
      const newer = this.#indexBack(step);
      const older = this.#indexBack(step + 1);

      if (this.#time[older] <= time && time <= this.#time[newer]) {
        const span = this.#time[newer] - this.#time[older];
        const t = span > 0 ? (time - this.#time[older]) / span : 0;

        out.x = this.#x[older] + (this.#x[newer] - this.#x[older]) * t;
        out.direction = this.#direction[t < 0.5 ? older : newer];

        return true;
      }
    }

    // Asked for a moment older than anything recorded: the scene has only
    // just started, so hold at the oldest known point.
    const oldest = this.#indexBack(this.#count - 1);

    out.x = this.#x[oldest];
    out.direction = this.#direction[oldest];

    return true;
  }

  #indexBack(step) {
    return (this.#head - step + this.#capacity * 2) % this.#capacity;
  }
}
