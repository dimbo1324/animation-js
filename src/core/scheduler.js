/**
 * Frame scheduler.
 *
 * Every deferred job in the engine — reactive effects, DOM measurements,
 * DOM mutations — goes through this one queue so that a frame contains at
 * most one read pass and one write pass. That ordering is what keeps
 * layout thrash out of the animation loop.
 *
 * Phase order inside a flush: effects, then reads, then writes. Effects
 * enqueue reads and writes, so the cycle repeats until the queues drain.
 */

const PHASES = ['effect', 'read', 'write'];
const MAX_PASSES = 5;

const queues = {
  effect: new Set(),
  read: [],
  write: [],
};

let frameHandle = 0;
let flushing = false;

const raf =
  typeof requestAnimationFrame === 'function'
    ? requestAnimationFrame
    : (callback) => setTimeout(() => callback(performance.now()), 16);

const cancelRaf =
  typeof cancelAnimationFrame === 'function'
    ? cancelAnimationFrame
    : clearTimeout;

/**
 * Queue a job for the next frame.
 * @param {'effect' | 'read' | 'write'} phase - Phase the job belongs to.
 * @param {Function} job - Work to run. Effects are deduplicated by identity.
 */
export function schedule(phase, job) {
  const queue = queues[phase];

  if (queue instanceof Set) {
    queue.add(job);
  } else {
    queue.push(job);
  }

  requestFlush();
}

/**
 * Drain every queue immediately, on the current stack.
 *
 * Call this when work must be visible before the next frame — teardown,
 * synchronous measurement, tests. The ticker calls it once per frame so
 * that a running loop never pays for a second scheduled callback.
 */
export function flushScheduler() {
  if (flushing) {
    return;
  }

  cancelPendingFrame();
  flushing = true;

  try {
    for (let pass = 0; pass < MAX_PASSES && hasWork(); pass += 1) {
      runPass();
    }

    if (hasWork()) {
      clearQueues();
      throw new Error(
        'scheduler: queues did not settle after '
          + `${MAX_PASSES} passes; a job is re-queueing itself every pass`,
      );
    }
  } finally {
    flushing = false;
  }
}

/**
 * Drop every queued job without running it.
 *
 * Only for teardown of a whole application instance.
 */
export function clearQueues() {
  queues.effect.clear();
  queues.read.length = 0;
  queues.write.length = 0;
  cancelPendingFrame();
}

function requestFlush() {
  if (flushing || frameHandle !== 0) {
    return;
  }

  frameHandle = raf(() => {
    frameHandle = 0;
    flushScheduler();
  });
}

function cancelPendingFrame() {
  if (frameHandle !== 0) {
    cancelRaf(frameHandle);
    frameHandle = 0;
  }
}

function hasWork() {
  return PHASES.some((phase) => size(queues[phase]) > 0);
}

function runPass() {
  runEffects();
  runList(queues.read);
  runList(queues.write);
}

function runEffects() {
  const pending = queues.effect;

  if (pending.size === 0) {
    return;
  }

  const batch = [...pending];
  pending.clear();

  for (const job of batch) {
    job();
  }
}

function runList(queue) {
  if (queue.length === 0) {
    return;
  }

  const batch = queue.splice(0, queue.length);

  for (const job of batch) {
    job();
  }
}

function size(queue) {
  return queue instanceof Set ? queue.size : queue.length;
}
