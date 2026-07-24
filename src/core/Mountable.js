/**
 * What a scene and a model have in common.
 *
 * Both own a root element, both are told how large that element is, both
 * run on the shared ticker, and both must give back every listener and
 * effect they took. Only the vocabulary differs: a scene is the surface a
 * model is placed on, a model is the figure standing on it.
 *
 * Lifecycle, in order:
 *
 *   onMount()          once, after the root is in the document
 *   onResize(viewport) immediately after mount, then on every size change
 *   onUpdate(dt)       every frame, simulation only, no DOM
 *   onRender(alpha)    every frame, DOM writes only, no measurement
 *   onDestroy()        once, undo everything onMount did
 *
 * Subclasses never call these themselves; the host that mounted them does.
 */

import { effect } from './reactive.js';

const EMPTY_VIEWPORT = { width: 0, height: 0, left: 0, top: 0 };

export class Mountable {
  /** @type {string} Stable identifier used by registries and by CSS. */
  static id = 'mountable';

  /** @type {string} Human-readable name shown in the shell. */
  static title = 'Untitled';

  #root;
  #source;
  #viewport = EMPTY_VIEWPORT;
  #disposers = [];
  #mounted = false;

  /**
   * @param {object} context - Provided by the host.
   * @param {HTMLElement} context.root - Element this object owns.
   * @param {import('./Observable.js').Observable} [context.viewport] -
   *   Channel publishing the size of the container. Subscribed on mount,
   *   released on destroy.
   */
  constructor({ root, viewport = null }) {
    this.#root = root;
    this.#source = viewport;
  }

  /** @returns {HTMLElement} The element this object owns. */
  get root() {
    return this.#root;
  }

  /**
   * Size and page offset of the container, as of the last measurement.
   *
   * Already measured — reading it costs nothing and forces no layout.
   * Never call `getBoundingClientRect()` yourself in a frame path; take
   * the numbers from here.
   *
   * @returns {{ width: number, height: number, left: number, top: number }}
   *   The current viewport.
   */
  get viewport() {
    return this.#viewport;
  }

  /** @returns {boolean} True between `onMount` and `onDestroy`. */
  get mounted() {
    return this.#mounted;
  }

  /** Build DOM, create entities, subscribe. Runs once. */
  onMount() {}

  /**
   * Advance the simulation. Never touch the DOM here.
   * @param {number} _dt - Seconds since the previous update, clamped.
   * @param {number} _elapsed - Seconds of simulated time since start.
   */
  onUpdate(_dt, _elapsed) {}

  /**
   * Write the current state to the DOM. Never measure here.
   * @param {number} _alpha - Interpolation factor when the ticker runs a
   *   fixed step; `1` in variable-step mode.
   */
  onRender(_alpha) {}

  /**
   * React to the container changing size.
   * @param {{ width: number, height: number, left: number, top: number }}
   *   _viewport - The new viewport.
   */
  onResize(_viewport) {}

  /** Undo everything `onMount` did. Runs once. */
  onDestroy() {}

  /**
   * Register teardown work to run on destroy, in reverse order.
   * @param {() => void} dispose - Teardown callback.
   * @returns {() => void} The same callback, for convenience.
   */
  addDisposer(dispose) {
    this.#disposers.push(dispose);

    return dispose;
  }

  /**
   * Add an event listener that is removed automatically on destroy.
   * @param {EventTarget} target - Listener target.
   * @param {string} type - Event type.
   * @param {EventListener} handler - Listener callback.
   * @param {AddEventListenerOptions} [options] - Listener options.
   */
  listen(target, type, handler, options) {
    target.addEventListener(type, handler, options);

    this.addDisposer(() =>
      target.removeEventListener(type, handler, options),
    );
  }

  /**
   * Create a reactive effect that is disposed automatically on destroy.
   * @param {Function} fn - Effect body.
   * @returns {() => void} Disposer, already registered for teardown.
   */
  watch(fn) {
    return this.addDisposer(effect(fn));
  }

  /**
   * Run the mount lifecycle. Called by the host; do not call directly.
   * @internal
   */
  mount() {
    if (this.#mounted) {
      return;
    }

    this.#mounted = true;
    this.onMount();

    if (this.#source !== null) {
      this.addDisposer(
        this.#source.subscribe((viewport) => this.#applyViewport(viewport)),
      );
    }
  }

  /**
   * Run the destroy lifecycle and release every registered disposer.
   * Called by the host; do not call directly. Safe to call twice.
   * @internal
   */
  destroy() {
    if (!this.#mounted) {
      return;
    }

    this.#mounted = false;
    this.onDestroy();

    for (
      let index = this.#disposers.length - 1;
      index >= 0;
      index -= 1
    ) {
      this.#disposers[index]();
    }

    this.#disposers.length = 0;
    this.#viewport = EMPTY_VIEWPORT;
    this.#root.replaceChildren();
  }

  #applyViewport(viewport) {
    this.#viewport = viewport;

    if (this.#mounted) {
      this.onResize(viewport);
    }
  }
}
