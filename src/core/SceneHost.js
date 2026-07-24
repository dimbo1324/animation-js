/**
 * Mounts one scene at a time into a container element.
 *
 * This is the seam between the shell and the animations. The shell hands
 * over a container and never looks inside it again; the scene receives a
 * root element and never looks outside it. Swapping scenes is therefore a
 * single call, and no shell code changes when one is added.
 *
 * The host also owns the only measurement of that container. A single
 * `ResizeObserver` measures once per change and publishes the result on
 * `viewport`; the scene, the models it hosts, and anything else that needs
 * the number subscribe to the same channel. Nobody else calls
 * `getBoundingClientRect()` on the stage.
 */

import { Observable, sameViewport } from './Observable.js';
import { element, measureThenMutate } from './dom.js';

const EMPTY_VIEWPORT = { width: 0, height: 0, left: 0, top: 0 };

export class SceneHost {
  #container;
  #ticker;
  #scene = null;
  #root = null;
  #unsubscribe = null;
  #observer;
  #viewport = new Observable(EMPTY_VIEWPORT, { equals: sameViewport });

  /**
   * @param {HTMLElement} container - Element scenes are mounted into.
   * @param {import('./Ticker.js').Ticker} ticker - Loop that drives scenes.
   */
  constructor(container, ticker) {
    this.#container = container;
    this.#ticker = ticker;
    this.#observer = new ResizeObserver(() => this.#measure());
    this.#observer.observe(container);
  }

  /** @returns {import('./Scene.js').Scene | null} The mounted scene. */
  get scene() {
    return this.#scene;
  }

  /** @returns {HTMLElement} The container scenes are mounted into. */
  get container() {
    return this.#container;
  }

  /**
   * Size and page offset of the container.
   * @returns {import('./Observable.js').Observable} Viewport channel.
   */
  get viewport() {
    return this.#viewport;
  }

  /**
   * Mount a scene, replacing whatever was mounted before.
   * @param {typeof import('./Scene.js').Scene} SceneClass - Scene to mount.
   * @param {object} [config] - Mount configuration.
   * @param {object} [config.state] - Initial reactive state for the scene.
   * @param {object} [config.options] - Plain collaborators for the scene,
   *   such as the model class it should host.
   * @returns {import('./Scene.js').Scene} The mounted instance.
   */
  mount(SceneClass, { state, options } = {}) {
    this.unmount();

    const root = element('div', `scene scene--${SceneClass.id}`);

    this.#container.append(root);
    this.#root = root;

    const scene = new SceneClass({
      root,
      host: this,
      viewport: this.#viewport,
      state,
      options,
    });

    this.#scene = scene;
    scene.mount();

    this.#unsubscribe = this.#ticker.add({
      update: (dt, elapsed) => scene.onUpdate(dt, elapsed),
      render: (alpha) => scene.onRender(alpha),
    });

    // The stage rarely changes size at the moment a scene mounts, so the
    // observer would not fire and the scene would sit on a stale viewport.
    this.#measure();

    return scene;
  }

  /** Destroy the current scene and release every resource it held. */
  unmount() {
    if (this.#unsubscribe !== null) {
      this.#unsubscribe();
      this.#unsubscribe = null;
    }

    if (this.#scene !== null) {
      this.#scene.destroy();
      this.#scene = null;
    }

    if (this.#root !== null) {
      this.#root.remove();
      this.#root = null;
    }
  }

  /** Unmount and stop observing. The host is unusable afterwards. */
  dispose() {
    this.unmount();
    this.#observer.disconnect();
    this.#viewport.clear();
  }

  #measure() {
    measureThenMutate(
      () => this.#container.getBoundingClientRect(),
      (rect) => {
        this.#viewport.publish({
          width: rect.width,
          height: rect.height,
          left: rect.left,
          top: rect.top,
        });
      },
    );
  }
}
