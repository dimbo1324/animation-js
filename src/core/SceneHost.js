/**
 * Mounts one scene at a time into a container element.
 *
 * This is the seam between the shell and the animations. The shell hands
 * over a container and never looks inside it again; the scene receives a
 * root element and never looks outside it. Swapping animations is
 * therefore a single call, and no shell code changes when a scene is
 * added.
 */

import { element } from './dom.js';
import { schedule } from './scheduler.js';

export class SceneHost {
  #container;
  #ticker;
  #scene = null;
  #root = null;
  #unsubscribe = null;
  #observer = null;

  /**
   * @param {HTMLElement} container - Element scenes are mounted into.
   * @param {import('./Ticker.js').Ticker} ticker - Loop that drives scenes.
   */
  constructor(container, ticker) {
    this.#container = container;
    this.#ticker = ticker;
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
   * Mount a scene, replacing whatever was mounted before.
   * @param {typeof import('./Scene.js').Scene} SceneClass - Scene to mount.
   * @param {object} [options] - Mount options.
   * @param {object} [options.state] - Initial reactive state for the scene.
   * @returns {import('./Scene.js').Scene} The mounted instance.
   */
  mount(SceneClass, { state } = {}) {
    this.unmount();

    const root = element('div', `scene scene--${SceneClass.id}`);

    this.#container.append(root);
    this.#root = root;

    const scene = new SceneClass({ root, host: this, state });

    this.#scene = scene;
    scene.mount();

    this.#unsubscribe = this.#ticker.add({
      update: (dt, elapsed) => scene.onUpdate(dt, elapsed),
      render: (alpha) => scene.onRender(alpha),
    });

    this.#observeResize(scene);

    return scene;
  }

  /** Destroy the current scene and release every resource it held. */
  unmount() {
    if (this.#observer !== null) {
      this.#observer.disconnect();
      this.#observer = null;
    }

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

  #observeResize(scene) {
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (entry === undefined || !scene.mounted) {
        return;
      }

      const { width, height } = entry.contentRect;

      schedule('write', () => {
        if (scene.mounted) {
          scene.onResize({ width, height });
        }
      });
    });

    observer.observe(this.#container);
    this.#observer = observer;
  }
}
