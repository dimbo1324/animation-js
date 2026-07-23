/**
 * Base class for every animation in this project.
 *
 * A scene owns everything inside its root element and nothing outside it.
 * It never imports from the shell, never reaches into the page, and never
 * assumes anything about who mounted it. That isolation is what lets an
 * animation be written, replaced, or deleted without touching the frame
 * around it.
 *
 * Lifecycle, in order:
 *
 *   onMount()          once, after the root is in the document
 *   onUpdate(dt)       every frame, simulation only, no DOM
 *   onRender(alpha)    every frame, DOM writes only, no measurement
 *   onResize(size)     whenever the host changes size
 *   onDestroy()        once, undo everything onMount did
 */

import { effect, reactive } from './reactive.js';

export class Scene {
  /** @type {string} Stable identifier used by the registry and CSS. */
  static id = 'scene';

  /** @type {string} Human-readable name shown in the shell. */
  static title = 'Untitled scene';

  #root;
  #host;
  #state;
  #disposers = [];
  #mounted = false;

  /**
   * @param {object} context - Provided by the scene host.
   * @param {HTMLElement} context.root - Element the scene owns.
   * @param {import('./SceneHost.js').SceneHost} context.host - Host that
   *   mounted this scene.
   * @param {object} [context.state] - Initial reactive state.
   */
  constructor({ root, host, state = {} }) {
    this.#root = root;
    this.#host = host;
    this.#state = reactive(state);
  }

  /** @returns {HTMLElement} The element this scene owns. */
  get root() {
    return this.#root;
  }

  /** @returns {import('./SceneHost.js').SceneHost} The mounting host. */
  get host() {
    return this.#host;
  }

  /**
   * Reactive configuration for this scene.
   *
   * For modes, flags, and anything a control surface toggles. Per-entity
   * simulation state belongs in plain objects, not here.
   *
   * @returns {object} Reactive state proxy.
   */
  get state() {
    return this.#state;
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
   * React to the host changing size.
   * @param {{ width: number, height: number }} _size - New host size.
   */
  onResize(_size) {}

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
    this.#root.replaceChildren();
  }
}
