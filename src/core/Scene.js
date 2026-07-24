/**
 * Base class for every animation surface in this project.
 *
 * A scene owns everything inside its root element and nothing outside it.
 * It never imports from the shell, never reaches into the page, and never
 * assumes anything about who mounted it. That isolation is what lets a
 * scene be written, replaced, or deleted without touching the frame around
 * it.
 *
 * A scene is the stage, not the figure on it. Anything with a body, a
 * silhouette, and a behaviour belongs in `src/models/` as a `Model`; the
 * scene provides the ground it stands on, forwards frames and input to it,
 * and stays reusable for every model that comes later.
 *
 * See `Mountable` for the lifecycle every scene inherits.
 */

import { Mountable } from './Mountable.js';
import { reactive } from './reactive.js';

export class Scene extends Mountable {
  static id = 'scene';
  static title = 'Untitled scene';

  #host;
  #state;
  #options;

  /**
   * @param {object} context - Provided by the scene host.
   * @param {HTMLElement} context.root - Element the scene owns.
   * @param {import('./SceneHost.js').SceneHost} context.host - Host that
   *   mounted this scene.
   * @param {import('./Observable.js').Observable} context.viewport -
   *   Channel publishing the size of the container.
   * @param {object} [context.state] - Initial reactive state.
   * @param {object} [context.options] - Plain mount-time collaborators.
   *   Deliberately not reactive: this is where a class or a factory is
   *   handed in, and those must never end up behind a proxy.
   */
  constructor({ root, host, viewport, state = {}, options = {} }) {
    super({ root, viewport });

    this.#host = host;
    this.#state = reactive(state);
    this.#options = options;
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

  /** @returns {object} Mount-time collaborators, exactly as passed in. */
  get options() {
    return this.#options;
  }
}
