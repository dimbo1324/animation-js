/**
 * Mounts one model at a time into a container element.
 *
 * This is the seam between a scene and the figures standing on it, and it
 * is deliberately the same shape as `SceneHost`: build a root, construct,
 * subscribe to the viewport, drive, tear down. A scene that hosts three
 * models keeps three of these and knows nothing more about any of them.
 *
 * The class is handed in already loaded. Downloading a model is the
 * registry's job and belongs at the edge of the application, not inside a
 * frame path.
 */

import { element } from './dom.js';

export class ModelHost {
  #container;
  #viewport;
  #model = null;
  #root = null;

  /**
   * @param {HTMLElement} container - Element models are mounted into.
   * @param {import('./Observable.js').Observable} viewport - Channel
   *   publishing the container's size.
   */
  constructor(container, viewport) {
    this.#container = container;
    this.#viewport = viewport;
  }

  /** @returns {import('./Model.js').Model | null} The mounted model. */
  get model() {
    return this.#model;
  }

  /**
   * Mount a model, replacing whatever was mounted before.
   * @param {typeof import('./Model.js').Model} ModelClass - Loaded class.
   * @param {object} [config] - Mount configuration.
   * @param {object} [config.options] - Passed through to the model.
   * @param {number} [config.scale] - Initial zoom.
   * @returns {import('./Model.js').Model} The mounted instance.
   */
  mount(ModelClass, { options, scale = 1 } = {}) {
    this.unmount();

    const root = element('div', `model model--${ModelClass.id}`);

    this.#container.append(root);
    this.#root = root;

    const model = new ModelClass({
      root,
      host: this,
      viewport: this.#viewport,
      options,
    });

    model.scale = scale;
    this.#model = model;
    model.mount();

    return model;
  }

  /** Destroy the current model and release every resource it held. */
  unmount() {
    if (this.#model !== null) {
      this.#model.destroy();
      this.#model = null;
    }

    if (this.#root !== null) {
      this.#root.remove();
      this.#root = null;
    }
  }

  /**
   * Advance the model. Call from the scene's `onUpdate`.
   * @param {number} dt - Seconds since the previous update.
   * @param {number} elapsed - Seconds of simulated time since start.
   */
  update(dt, elapsed) {
    if (this.#model !== null) {
      this.#model.onUpdate(dt, elapsed);
    }
  }

  /**
   * Write the model to the DOM. Call from the scene's `onRender`.
   * @param {number} alpha - Interpolation factor from the ticker.
   */
  render(alpha) {
    if (this.#model !== null) {
      this.#model.onRender(alpha);
    }
  }

  /**
   * Forward a pointer event to the model.
   * @param {'move' | 'leave' | 'down'} kind - Which event happened.
   * @param {{ x: number, y: number }} [point] - Position in stage pixels.
   */
  pointer(kind, point) {
    const model = this.#model;

    if (model === null) {
      return;
    }

    if (kind === 'move') {
      model.onPointerMove(point);
    } else if (kind === 'down') {
      model.onPointerDown(point);
    } else {
      model.onPointerLeave();
    }
  }
}
