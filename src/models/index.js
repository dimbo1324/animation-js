/**
 * Model manifest.
 *
 * One entry per figure. Each model's data sheet lives inside its own
 * folder, so everything about a figure — its numbers, its code, its CSS —
 * is in one place; this file only says which of them exist.
 *
 * Adding a model means adding it to `MANIFESTS` below and adding one
 * `@import` to `models.css`. Nothing else in the repository changes.
 */

import { registerModel } from './registry.js';
import { manifest as creatures } from './creatures/manifest.js';

const MANIFESTS = [creatures];

for (const manifest of MANIFESTS) {
  registerModel(manifest);
}

export {
  getModel,
  hasModel,
  listModels,
  loadModel,
  registerModel,
} from './registry.js';

/**
 * Model the toolbar summons.
 *
 * Nothing is mounted on load: the stage starts empty on purpose, so the
 * demo never gets in the way of whatever is being built.
 */
export const DEMO_MODEL_ID = 'creatures';
