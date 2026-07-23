/**
 * Proxy-based reactivity.
 *
 * Reading a reactive property inside an effect records a dependency;
 * writing it re-runs exactly the effects that read it, once, on the next
 * frame. This is the project's default way to connect state to output —
 * there is no manual re-render call anywhere in the codebase.
 *
 * Use it for structure and configuration: themes, modes, selected scene,
 * paused state. Do NOT use it for per-entity simulation state; a thousand
 * proxied entities at 60 fps is exactly the overhead this file exists to
 * avoid. Those live in plain objects mutated inside `onUpdate`.
 */

import { schedule } from './scheduler.js';

const REACTIVE = Symbol('reactive');
const ITERATE = Symbol('iterate');

const proxyCache = new WeakMap();
const rawCache = new WeakMap();
const targetDeps = new WeakMap();

let activeEffect = null;

/**
 * Wrap an object in a reactive proxy.
 *
 * Nested objects are wrapped lazily, on first read, so untouched subtrees
 * cost nothing. Wrapping the same object twice returns the same proxy, and
 * wrapping a proxy returns it unchanged.
 *
 * @template {object} T
 * @param {T} target - Plain object or array to make reactive.
 * @returns {T} Reactive proxy over `target`.
 */
export function reactive(target) {
  if (!isObservable(target)) {
    return target;
  }

  if (target[REACTIVE] === true) {
    return target;
  }

  const existing = proxyCache.get(target);

  if (existing !== undefined) {
    return existing;
  }

  const proxy = new Proxy(target, handlers);

  proxyCache.set(target, proxy);
  rawCache.set(proxy, target);

  return proxy;
}

/**
 * Run a function and re-run it whenever its reactive dependencies change.
 *
 * Re-runs are batched: many writes in one frame produce one run, on the
 * next frame.
 *
 * @param {Function} fn - Body to run. Keep it small and single-purpose.
 * @returns {() => void} Disposer. Idempotent. **Always call it on
 *   teardown** — an effect that outlives its DOM is a leak.
 */
export function effect(fn) {
  const record = createEffect(fn);

  record.run();

  return () => stopEffect(record);
}

/**
 * Create a lazily evaluated, memoised value derived from reactive state.
 *
 * The getter runs on first read and again only after one of its own
 * dependencies changes.
 *
 * @template T
 * @param {() => T} getter - Pure derivation. No side effects.
 * @returns {{ readonly value: T, dispose: () => void }} Computed handle.
 */
export function computed(getter) {
  const token = {};

  let cached;
  let dirty = true;

  const record = createEffect(
    () => {
      cached = getter();
    },
    () => {
      if (dirty) {
        return;
      }

      dirty = true;
      trigger(token, 'value');
    },
  );

  return {
    get value() {
      if (dirty) {
        dirty = false;
        record.run();
      }

      track(token, 'value');

      return cached;
    },

    dispose() {
      stopEffect(record);
    },
  };
}

/**
 * Unwrap a reactive proxy back to the object it wraps.
 *
 * Use it to hand raw data to code that must not create dependencies —
 * per-frame simulation, structured cloning, serialisation.
 *
 * @template {object} T
 * @param {T} value - Reactive proxy or plain value.
 * @returns {T} The underlying object, or `value` if it was not reactive.
 */
export function toRaw(value) {
  return rawCache.get(value) ?? value;
}

/**
 * Check whether a value is a reactive proxy.
 * @param {unknown} value - Value to test.
 * @returns {boolean} True if `value` came from `reactive()`.
 */
export function isReactive(value) {
  return isObservable(value) && value[REACTIVE] === true;
}

const handlers = {
  get(target, key, receiver) {
    if (key === REACTIVE) {
      return true;
    }

    track(target, key);

    const value = Reflect.get(target, key, receiver);

    return isObservable(value) ? reactive(value) : value;
  },

  set(target, key, value, receiver) {
    const raw = toRaw(value);
    const previous = target[key];
    const isNewKey = !Object.hasOwn(target, key);
    const accepted = Reflect.set(target, key, raw, receiver);

    if (!accepted) {
      return false;
    }

    if (Object.is(previous, raw) && !isNewKey) {
      return true;
    }

    trigger(target, key);

    if (isNewKey) {
      trigger(target, ITERATE);
    }

    if (Array.isArray(target) && key !== 'length') {
      trigger(target, 'length');
    }

    return true;
  },

  deleteProperty(target, key) {
    const existed = Object.hasOwn(target, key);
    const deleted = Reflect.deleteProperty(target, key);

    if (deleted && existed) {
      trigger(target, key);
      trigger(target, ITERATE);
    }

    return deleted;
  },

  has(target, key) {
    track(target, key);

    return Reflect.has(target, key);
  },

  ownKeys(target) {
    track(target, ITERATE);

    return Reflect.ownKeys(target);
  },
};

function createEffect(fn, scheduler) {
  const record = {
    fn,
    scheduler,
    deps: new Set(),
    active: true,
    run: () => runEffect(record),
  };

  return record;
}

function runEffect(record) {
  if (!record.active) {
    return;
  }

  cleanup(record);

  const previous = activeEffect;
  activeEffect = record;

  try {
    record.fn();
  } finally {
    activeEffect = previous;
  }
}

function stopEffect(record) {
  if (!record.active) {
    return;
  }

  cleanup(record);
  record.active = false;
}

function cleanup(record) {
  for (const subscribers of record.deps) {
    subscribers.delete(record);
  }

  record.deps.clear();
}

function track(target, key) {
  if (activeEffect === null) {
    return;
  }

  let keyMap = targetDeps.get(target);

  if (keyMap === undefined) {
    keyMap = new Map();
    targetDeps.set(target, keyMap);
  }

  let subscribers = keyMap.get(key);

  if (subscribers === undefined) {
    subscribers = new Set();
    keyMap.set(key, subscribers);
  }

  if (!subscribers.has(activeEffect)) {
    subscribers.add(activeEffect);
    activeEffect.deps.add(subscribers);
  }
}

function trigger(target, key) {
  const keyMap = targetDeps.get(target);

  if (keyMap === undefined) {
    return;
  }

  const subscribers = keyMap.get(key);

  if (subscribers === undefined || subscribers.size === 0) {
    return;
  }

  for (const record of [...subscribers]) {
    if (record === activeEffect || !record.active) {
      continue;
    }

    if (record.scheduler !== undefined) {
      record.scheduler();
    } else {
      schedule('effect', record.run);
    }
  }
}

function isObservable(value) {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  if (Array.isArray(value)) {
    return true;
  }

  const prototype = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
}
