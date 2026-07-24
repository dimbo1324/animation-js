/**
 * An explicit subscribe/notify channel.
 *
 * The reactive layer covers state a human toggles: it batches to the next
 * frame and tracks dependencies automatically. Measurement is a different
 * problem. A size is produced once, by one owner, and several unrelated
 * consumers need it in the same frame it was measured — batching it would
 * delay every consumer by a frame, and proxy-tracking it would make a
 * measurement look like configuration.
 *
 * So sizes travel on this channel instead: one publisher, many
 * subscribers, delivered synchronously, deduplicated by value.
 *
 * @template T
 */
export class Observable {
  #value;
  #equals;
  #listeners = new Set();

  /**
   * @param {T} value - Initial value, delivered to new subscribers.
   * @param {object} [options] - Channel options.
   * @param {(a: T, b: T) => boolean} [options.equals] - Equality test. A
   *   publish that passes it notifies nobody. Defaults to `Object.is`,
   *   which never dedupes object payloads — pass a comparator for those.
   */
  constructor(value, { equals = Object.is } = {}) {
    this.#value = value;
    this.#equals = equals;
  }

  /** @returns {T} The value most recently published. */
  get value() {
    return this.#value;
  }

  /** @returns {number} How many listeners are subscribed. */
  get size() {
    return this.#listeners.size;
  }

  /**
   * Publish a value and notify every subscriber that it changed.
   * @param {T} value - New value.
   * @returns {boolean} True when the value changed and listeners ran.
   */
  publish(value) {
    if (this.#equals(this.#value, value)) {
      return false;
    }

    this.#value = value;

    // A snapshot, because a listener is allowed to unsubscribe itself — or
    // anyone else — while being notified.
    for (const listener of [...this.#listeners]) {
      if (this.#listeners.has(listener)) {
        listener(value);
      }
    }

    return true;
  }

  /**
   * Subscribe to future values.
   * @param {(value: T) => void} listener - Called on every change.
   * @param {object} [options] - Subscription options.
   * @param {boolean} [options.immediate] - Deliver the current value right
   *   away. On by default: a subscriber that joins late still needs the
   *   size that was measured before it existed.
   * @returns {() => void} Unsubscribe. Idempotent. **Always call it on
   *   teardown** — a listener that outlives its owner is a leak.
   */
  subscribe(listener, { immediate = true } = {}) {
    this.#listeners.add(listener);

    if (immediate) {
      listener(this.#value);
    }

    return () => {
      this.#listeners.delete(listener);
    };
  }

  /** Drop every subscriber. For teardown of the publisher itself. */
  clear() {
    this.#listeners.clear();
  }
}

/**
 * Compare two viewport payloads.
 *
 * A `ResizeObserver` fires for changes this project does not care about —
 * sub-pixel jitter during a drag, most of all. Rounding to whole pixels
 * before comparing keeps a scene from rebuilding its geometry over a
 * hundredth of a pixel.
 *
 * @param {{ width: number, height: number, left: number, top: number }} a
 *   Previous viewport.
 * @param {{ width: number, height: number, left: number, top: number }} b
 *   Candidate viewport.
 * @returns {boolean} True when the two are the same to the pixel.
 */
export function sameViewport(a, b) {
  return (
    Math.round(a.width) === Math.round(b.width)
    && Math.round(a.height) === Math.round(b.height)
    && Math.round(a.left) === Math.round(b.left)
    && Math.round(a.top) === Math.round(b.top)
  );
}
