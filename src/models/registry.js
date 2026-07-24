/**
 * Model registry.
 *
 * The catalogue of every figure in `src/models/`. Descriptors are cheap and
 * always present; the code behind one arrives on first mount.
 *
 * `minStage` is derived here, once, so that the shell can size the tile
 * around a figure it has not downloaded yet.
 */

import { createLazyRegistry, minStageFor } from '../core/index.js';

const models = createLazyRegistry({
  kind: 'model',

  describe: (descriptor) => ({
    ...descriptor,
    minStage: minStageFor(descriptor),
  }),
});

/**
 * Register one model.
 * @param {object} manifest - The model's data sheet.
 * @param {string} manifest.id - Stable kebab-case identifier. Must match
 *   the class's `static id`.
 * @param {string} manifest.title - Human-readable name.
 * @param {{ width: number, height: number }} manifest.naturalSize - The
 *   pixel box the figure is authored for.
 * @param {{ min: number, max: number }} [manifest.fitRange] - How far the
 *   automatic fit may go.
 * @param {{ width: number, height: number }} [manifest.minStage] - Hard
 *   floor on the stage, when the derived one is not what the figure wants.
 * @param {() => Promise<object>} manifest.load - Dynamic import returning a
 *   module whose default export is a `Model` subclass.
 */
export function registerModel(manifest) {
  models.register(manifest);
}

/**
 * List every registered model without loading any of them.
 * @returns {object[]} Registered model descriptors.
 */
export function listModels() {
  return models.list();
}

/**
 * Check whether a model id is registered.
 * @param {string} id - Model identifier.
 * @returns {boolean} True if the model exists.
 */
export function hasModel(id) {
  return models.has(id);
}

/**
 * Read a model's data sheet without loading its code.
 * @param {string} id - Model identifier.
 * @returns {object} The descriptor, including the derived `minStage`.
 */
export function getModel(id) {
  return models.get(id);
}

/**
 * Load a model class, importing its module on first use.
 * @param {string} id - Model identifier.
 * @returns {Promise<typeof import('../core/index.js').Model>} Model class.
 */
export function loadModel(id) {
  return models.load(id);
}
