/**
 * Scene registry.
 *
 * Scenes are registered by id with a lazy loader, so the browser downloads
 * a scene only when it is actually mounted. The shell can list what exists
 * without importing any of it.
 */

import { createLazyRegistry } from './lazyRegistry.js';

const scenes = createLazyRegistry({ kind: 'scene' });

/**
 * Register one scene.
 * @param {object} descriptor - Scene descriptor.
 * @param {string} descriptor.id - Stable kebab-case identifier.
 * @param {string} descriptor.title - Human-readable name.
 * @param {() => Promise<object>} descriptor.load - Dynamic import returning
 *   a module whose default export is a `Scene` subclass.
 */
export function registerScene(descriptor) {
  scenes.register(descriptor);
}

/**
 * List every registered scene without loading any of them.
 * @returns {Array<{ id: string, title: string }>} Registered scenes.
 */
export function listScenes() {
  return scenes.list();
}

/**
 * Check whether a scene id is registered.
 * @param {string} id - Scene identifier.
 * @returns {boolean} True if the scene exists.
 */
export function hasScene(id) {
  return scenes.has(id);
}

/**
 * Read a scene's metadata without loading its code.
 * @param {string} id - Scene identifier.
 * @returns {{ id: string, title: string }} The descriptor.
 */
export function getScene(id) {
  return scenes.get(id);
}

/**
 * Load a scene class, importing its module on first use.
 * @param {string} id - Scene identifier.
 * @returns {Promise<typeof import('./Scene.js').Scene>} Scene class.
 */
export function loadScene(id) {
  return scenes.load(id);
}
