/**
 * A catalogue of things that are described now and downloaded later.
 *
 * Both scenes and models need the same three properties: the shell can
 * list what exists without importing any of it, the code for one arrives
 * only when it is actually mounted, and asking for an unknown id fails
 * loudly instead of silently mounting nothing.
 *
 * Descriptors are metadata, so anything the application must know before
 * the code exists — a title, a size — belongs in the descriptor rather
 * than on the class.
 */

/**
 * Create an independent registry.
 * @param {object} config - Registry configuration.
 * @param {string} config.kind - Noun used in error messages, e.g. `scene`.
 * @param {(descriptor: object) => object} [config.describe] - Runs once at
 *   registration; returns the public descriptor. Use it to derive metadata
 *   there instead of on every lookup.
 * @returns {{
 *   register: (descriptor: object) => void,
 *   list: () => object[],
 *   has: (id: string) => boolean,
 *   get: (id: string) => object,
 *   load: (id: string) => Promise<Function>,
 * }} The registry.
 */
export function createLazyRegistry({ kind, describe = (entry) => entry }) {
  const entries = new Map();

  function entryFor(id) {
    const entry = entries.get(id);

    if (entry === undefined) {
      throw new Error(
        `registry: unknown ${kind} "${id}"; registered: `
          + `${[...entries.keys()].join(', ') || '(none)'}`,
      );
    }

    return entry;
  }

  return {
    register({ load, ...descriptor }) {
      const { id } = descriptor;

      if (entries.has(id)) {
        throw new Error(
          `registry: ${kind} "${id}" is already registered`,
        );
      }

      if (typeof load !== 'function') {
        throw new Error(
          `registry: ${kind} "${id}" needs a load() returning an import`,
        );
      }

      entries.set(id, {
        descriptor: Object.freeze(describe(descriptor)),
        load,
        pending: null,
      });
    },

    /** @returns {object[]} Every descriptor, with no code loaded. */
    list() {
      return [...entries.values()].map((entry) => entry.descriptor);
    },

    has(id) {
      return entries.has(id);
    },

    /** @returns {object} One descriptor. Throws on an unknown id. */
    get(id) {
      return entryFor(id).descriptor;
    },

    /** @returns {Promise<Function>} The default-exported class. */
    async load(id) {
      const entry = entryFor(id);

      entry.pending ??= entry.load();

      const module = await entry.pending;
      const Loaded = module.default;

      if (typeof Loaded !== 'function') {
        entry.pending = null;

        throw new Error(
          `registry: ${kind} "${id}" must default-export a class`,
        );
      }

      if (Loaded.id !== id) {
        throw new Error(
          `registry: ${kind} "${id}" exports a class whose static id is `
            + `"${Loaded.id}"; the manifest and the class disagree`,
        );
      }

      return Loaded;
    },
  };
}
