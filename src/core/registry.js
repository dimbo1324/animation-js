/**
 * Scene registry.
 *
 * Scenes are registered by id with a lazy loader, so the browser downloads
 * an animation only when it is actually mounted. The shell can list what
 * exists without importing any of it.
 */

/** @type {Map<string, { id: string, title: string, load: Function, pending: Promise<object> | null }>} */
const entries = new Map();

/**
 * Register one scene.
 * @param {object} descriptor - Scene descriptor.
 * @param {string} descriptor.id - Stable kebab-case identifier.
 * @param {string} descriptor.title - Human-readable name.
 * @param {() => Promise<object>} descriptor.load - Dynamic import returning
 *   a module whose default export is a `Scene` subclass.
 */
export function registerScene({ id, title, load }) {
  if (entries.has(id)) {
    throw new Error(`registry: scene "${id}" is already registered`);
  }

  entries.set(id, { id, title, load, pending: null });
}

/**
 * List every registered scene without loading any of them.
 * @returns {Array<{ id: string, title: string }>} Registered scenes.
 */
export function listScenes() {
  return [...entries.values()].map(({ id, title }) => ({ id, title }));
}

/**
 * Check whether a scene id is registered.
 * @param {string} id - Scene identifier.
 * @returns {boolean} True if the scene exists.
 */
export function hasScene(id) {
  return entries.has(id);
}

/**
 * Load a scene class, importing its module on first use.
 * @param {string} id - Scene identifier.
 * @returns {Promise<typeof import('./Scene.js').Scene>} Scene class.
 */
export async function loadScene(id) {
  const entry = entries.get(id);

  if (entry === undefined) {
    throw new Error(
      `registry: unknown scene "${id}"; registered: `
        + `${[...entries.keys()].join(', ') || '(none)'}`,
    );
  }

  entry.pending ??= entry.load();

  const module = await entry.pending;
  const SceneClass = module.default;

  if (typeof SceneClass !== 'function') {
    entry.pending = null;

    throw new Error(
      `registry: scene "${id}" must default-export a Scene subclass`,
    );
  }

  return SceneClass;
}
