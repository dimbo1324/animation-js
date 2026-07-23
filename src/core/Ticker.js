/**
 * The single animation loop.
 *
 * One `requestAnimationFrame` loop drives the whole application. Scenes and
 * shell widgets subscribe to it; nothing opens a private loop. Parallel
 * loops desynchronise, duplicate layout work, and make frame budgets
 * impossible to reason about.
 *
 * Each frame runs update before render, for every subscriber, in priority
 * order. Simulation happens in update and never touches the DOM; DOM writes
 * happen in render and never measure.
 */

import { flushScheduler } from './scheduler.js';

const DEFAULT_MAX_DELTA = 0.1;
const FPS_SMOOTHING = 0.1;

export class Ticker {
  #listeners = [];
  #ordered = [];
  #orderDirty = false;
  #handle = 0;
  #running = false;
  #lastTime = 0;
  #elapsed = 0;
  #accumulator = 0;
  #smoothedDelta = 1 / 60;
  #fixedStep;
  #maxDelta;
  #timeScale = 1;
  #onVisibilityChange;

  /**
   * @param {object} [options] - Loop configuration.
   * @param {number} [options.fixedStep] - Fixed update step in seconds. Zero
   *   means variable step. Use a fixed step when simulation must be
   *   deterministic; `onRender` then receives an interpolation alpha.
   * @param {number} [options.maxDelta] - Upper bound on a single frame's
   *   delta, in seconds. Stops a stalled tab or a debugger pause from
   *   teleporting entities across the scene.
   */
  constructor({ fixedStep = 0, maxDelta = DEFAULT_MAX_DELTA } = {}) {
    this.#fixedStep = fixedStep;
    this.#maxDelta = maxDelta;
    this.#onVisibilityChange = () => this.#resetClock();
  }

  /** @returns {boolean} True while the loop is scheduled. */
  get running() {
    return this.#running;
  }

  /** @returns {number} Seconds of simulated time since the first frame. */
  get elapsed() {
    return this.#elapsed;
  }

  /** @returns {number} Smoothed frames per second. */
  get fps() {
    return 1 / this.#smoothedDelta;
  }

  /** @returns {number} Multiplier applied to every delta. */
  get timeScale() {
    return this.#timeScale;
  }

  /**
   * Slow down, speed up, or freeze simulated time.
   * @param {number} value - Multiplier. `0` freezes, `1` is real time.
   */
  set timeScale(value) {
    this.#timeScale = Math.max(0, value);
  }

  /**
   * Subscribe to the loop.
   * @param {object} listener - Frame callbacks.
   * @param {(dt: number, elapsed: number) => void} [listener.update] -
   *   Simulation step. Must not touch the DOM.
   * @param {(alpha: number) => void} [listener.render] - DOM write step.
   *   Must not measure the DOM.
   * @param {number} [listener.priority] - Lower runs first. Default `0`.
   * @returns {() => void} Disposer. Idempotent.
   */
  add({ update, render, priority = 0 }) {
    const entry = { update, render, priority, active: true };

    this.#listeners.push(entry);
    this.#orderDirty = true;

    return () => {
      if (!entry.active) {
        return;
      }

      entry.active = false;

      const index = this.#listeners.indexOf(entry);

      if (index !== -1) {
        this.#listeners.splice(index, 1);
      }

      this.#orderDirty = true;
    };
  }

  /** Start the loop. Safe to call when already running. */
  start() {
    if (this.#running) {
      return;
    }

    this.#running = true;
    this.#resetClock();

    document.addEventListener(
      'visibilitychange',
      this.#onVisibilityChange,
    );

    this.#handle = requestAnimationFrame(this.#tick);
  }

  /** Stop the loop. Safe to call when already stopped. */
  stop() {
    if (!this.#running) {
      return;
    }

    this.#running = false;

    cancelAnimationFrame(this.#handle);
    this.#handle = 0;

    document.removeEventListener(
      'visibilitychange',
      this.#onVisibilityChange,
    );
  }

  #tick = (now) => {
    if (!this.#running) {
      return;
    }

    this.#handle = requestAnimationFrame(this.#tick);

    const rawDelta = (now - this.#lastTime) / 1000;

    this.#lastTime = now;

    const delta = Math.min(Math.max(rawDelta, 0), this.#maxDelta);

    this.#smoothedDelta +=
      (delta - this.#smoothedDelta) * FPS_SMOOTHING;

    const scaled = delta * this.#timeScale;

    this.#elapsed += scaled;

    const listeners = this.#resolveOrder();
    const alpha = this.#runUpdates(listeners, scaled);

    this.#runRenders(listeners, alpha);

    flushScheduler();
  };

  #runUpdates(listeners, delta) {
    if (this.#fixedStep <= 0) {
      this.#dispatchUpdate(listeners, delta);

      return 1;
    }

    this.#accumulator += delta;

    while (this.#accumulator >= this.#fixedStep) {
      this.#dispatchUpdate(listeners, this.#fixedStep);
      this.#accumulator -= this.#fixedStep;
    }

    return this.#accumulator / this.#fixedStep;
  }

  #dispatchUpdate(listeners, delta) {
    for (let index = 0; index < listeners.length; index += 1) {
      const entry = listeners[index];

      if (entry.active && entry.update !== undefined) {
        entry.update(delta, this.#elapsed);
      }
    }
  }

  #runRenders(listeners, alpha) {
    for (let index = 0; index < listeners.length; index += 1) {
      const entry = listeners[index];

      if (entry.active && entry.render !== undefined) {
        entry.render(alpha);
      }
    }
  }

  #resolveOrder() {
    if (this.#orderDirty) {
      this.#ordered = [...this.#listeners].sort(
        (left, right) => left.priority - right.priority,
      );
      this.#orderDirty = false;
    }

    return this.#ordered;
  }

  #resetClock() {
    this.#lastTime = performance.now();
    this.#accumulator = 0;
  }
}

/** Shared application loop. Import this rather than constructing a Ticker. */
export const ticker = new Ticker();
