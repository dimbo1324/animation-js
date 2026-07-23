/**
 * DOM read/write batching.
 *
 * Reading a geometric property after a style write forces a synchronous
 * reflow. Inside a loop over N elements that is N reflows per frame. These
 * helpers push measurement into the frame's read pass and mutation into the
 * write pass, so the browser lays out once regardless of how many callers
 * are involved.
 *
 * Rule of thumb: if a function both measures and mutates, it is wrong.
 * Split it into a `read` that returns numbers and a `write` that consumes
 * them.
 */

import { schedule } from './scheduler.js';

/**
 * Queue a DOM measurement for the frame's read pass.
 *
 * Layout-forcing reads that belong here: `offsetWidth`, `offsetHeight`,
 * `clientWidth`, `clientHeight`, `scrollTop`, `getBoundingClientRect()`,
 * `getComputedStyle()`.
 *
 * @param {() => void} job - Measurement work. Must not mutate the DOM.
 */
export function read(job) {
  schedule('read', job);
}

/**
 * Queue a DOM mutation for the frame's write pass.
 * @param {() => void} job - Mutation work. Must not measure the DOM.
 */
export function write(job) {
  schedule('write', job);
}

/**
 * Measure an element once, then hand the result to a mutation callback.
 *
 * The measurement lands in the read pass and the mutation in the write
 * pass of the same frame, which is the only safe ordering.
 *
 * @template T
 * @param {() => T} measure - Runs in the read pass; returns the numbers.
 * @param {(measurement: T) => void} mutate - Runs in the write pass.
 */
export function measureThenMutate(measure, mutate) {
  read(() => {
    const measurement = measure();

    write(() => mutate(measurement));
  });
}

/**
 * Build a transform string without allocating a new object per frame.
 *
 * `translate3d` is used deliberately: it promotes the element to its own
 * compositor layer, which keeps the animation off the layout path.
 *
 * @param {number} x - Horizontal offset in pixels.
 * @param {number} y - Vertical offset in pixels.
 * @param {number} [scaleX] - Horizontal scale factor.
 * @param {number} [scaleY] - Vertical scale factor.
 * @param {number} [rotation] - Rotation in degrees.
 * @returns {string} Value for the `transform` property.
 */
export function transform(x, y, scaleX = 1, scaleY = 1, rotation = 0) {
  let value = `translate3d(${x}px, ${y}px, 0)`;

  if (rotation !== 0) {
    value += ` rotate(${rotation}deg)`;
  }

  if (scaleX !== 1 || scaleY !== 1) {
    value += ` scale(${scaleX}, ${scaleY})`;
  }

  return value;
}

/**
 * Create an element with a class and optional children, in one call.
 * @param {string} tag - Tag name.
 * @param {string} className - Class attribute value.
 * @param {...Node} children - Nodes to append.
 * @returns {HTMLElement} The created element.
 */
export function element(tag, className, ...children) {
  const node = document.createElement(tag);

  node.className = className;

  if (children.length > 0) {
    node.append(...children);
  }

  return node;
}

/**
 * Report whether the user has asked for reduced motion.
 *
 * Every scene must have a sane path for `true`: a static pose, or motion
 * slow enough not to provoke discomfort.
 *
 * @returns {boolean} True when `prefers-reduced-motion: reduce` matches.
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
