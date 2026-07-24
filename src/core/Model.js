/**
 * Base class for every figure in `src/models/`.
 *
 * A model is one animated thing: a character, a machine, a graphical
 * process. It owns its geometry, its simulation, its DOM nodes, and its
 * stylesheet, and it knows nothing about which scene is hosting it or what
 * the page around that scene looks like.
 *
 * What the outside gets in return is a uniform handle. Whatever the figure
 * is, its host can mount it, drive it, scale it, resize it, and throw it
 * away through the same five calls — which is the whole point of the
 * layer: adding a figure must never mean teaching anything above it a new
 * vocabulary.
 *
 * Two numbers make that work:
 *
 * - `naturalSize` is the box the figure was drawn for. It is the model's
 *   own statement about how much room it wants, and it is what lets the
 *   shell size the tile around the figure rather than the other way round.
 * - `renderScale` is what to actually draw at: the automatic fit into the
 *   current viewport, multiplied by whatever scale the host asked for.
 *   Every length a model draws should be multiplied by it.
 *
 * See `Mountable` for the lifecycle every model inherits.
 */

import { Mountable } from './Mountable.js';
import { clamp } from '../utils/math.js';

export class Model extends Mountable {
  static id = 'model';
  static title = 'Untitled model';

  /**
   * @type {{ width: number, height: number }} The pixel box this figure is
   * authored for. `renderScale` is 1 when the viewport matches it exactly.
   */
  static naturalSize = { width: 320, height: 320 };

  /**
   * @type {{ min: number, max: number }} How far the automatic fit may go.
   * A figure that stays legible when tiny can lower `min`; one built from
   * hand-tuned pixel detail should keep the range narrow.
   */
  static fitRange = { min: 0.4, max: 1.6 };

  /**
   * @type {{ width: number, height: number } | undefined} Optional hard
   * floor on the stage this figure will accept. Left undefined it is
   * derived from `naturalSize` and the low end of `fitRange`; declare it
   * when a figure has a size it genuinely must not go below.
   */
  static minStage = undefined;

  #host;
  #options;
  #scale = 1;

  /**
   * @param {object} context - Provided by the model host.
   * @param {HTMLElement} context.root - Element the model owns.
   * @param {import('./ModelHost.js').ModelHost} context.host - Host that
   *   mounted this model.
   * @param {import('./Observable.js').Observable} context.viewport -
   *   Channel publishing the size of the container.
   * @param {object} [context.options] - Model-specific configuration.
   */
  constructor({ root, host, viewport, options = {} }) {
    super({ root, viewport });

    this.#host = host;
    this.#options = options;
  }

  /** @returns {import('./ModelHost.js').ModelHost} The mounting host. */
  get host() {
    return this.#host;
  }

  /** @returns {object} Configuration passed at mount time. */
  get options() {
    return this.#options;
  }

  /**
   * How the figure was fitted into the current viewport, before any scale
   * the host asked for.
   * @returns {number} Fit factor, inside `fitRange`.
   */
  get fit() {
    const { width, height } = this.constructor.naturalSize;
    const { min, max } = this.constructor.fitRange;
    const viewport = this.viewport;

    if (width <= 0 || height <= 0) {
      return 1;
    }

    if (viewport.width === 0 || viewport.height === 0) {
      return clamp(1, min, max);
    }

    return clamp(
      Math.min(viewport.width / width, viewport.height / height),
      min,
      max,
    );
  }

  /** @returns {number} The multiplier the host asked for. `1` by default. */
  get scale() {
    return this.#scale;
  }

  /**
   * Zoom the figure, independently of how the viewport fitted it.
   * @param {number} value - Positive multiplier.
   */
  set scale(value) {
    if (!(value > 0)) {
      throw new Error(
        `Model: scale must be a positive number, received ${value}`,
      );
    }

    this.#scale = value;
  }

  /**
   * The number every length in `onRender` should be multiplied by.
   * @returns {number} Fit factor times the host's scale.
   */
  get renderScale() {
    return this.fit * this.#scale;
  }

  /**
   * Pointer moved over the stage.
   * @param {{ x: number, y: number }} _point - Position in stage pixels,
   *   the same space as `viewport.width` and `viewport.height`. The object
   *   is reused between events so that moving a pointer allocates nothing:
   *   copy the numbers out, never keep the reference.
   */
  onPointerMove(_point) {}

  /** Pointer left the stage. */
  onPointerLeave() {}

  /**
   * Pointer pressed on the stage.
   * @param {{ x: number, y: number }} _point - Position in stage pixels.
   */
  onPointerDown(_point) {}
}

/**
 * The smallest stage a figure will accept.
 *
 * Deliberately a free function as well as a static getter: the shell has
 * to size the tile before the model's code has been downloaded, so it asks
 * the registry descriptor — the same shape, without the behaviour.
 *
 * @param {{
 *   naturalSize: { width: number, height: number },
 *   fitRange?: { min: number, max: number },
 *   minStage?: { width: number, height: number },
 * }} descriptor - A model class or its manifest entry.
 * @returns {{ width: number, height: number }} Minimum stage in pixels.
 */
export function minStageFor(descriptor) {
  if (descriptor.minStage !== undefined) {
    return descriptor.minStage;
  }

  const { width, height } = descriptor.naturalSize;
  const min = descriptor.fitRange?.min ?? Model.fitRange.min;

  return {
    width: Math.round(width * min),
    height: Math.round(height * min),
  };
}
