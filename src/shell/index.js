/**
 * Public surface of the shell.
 *
 * The shell is the frame around the animation. It exposes exactly one
 * thing to the rest of the application: a `stage` element to mount scenes
 * into. It must never import from `src/scenes/`.
 */

import { createTile } from './Tile.js';

export {
  setStageMin,
  shellState,
  sizeLocked,
  toggleScene,
  toggleTheme,
} from './state.js';

/**
 * Build the application shell.
 * @returns {{
 *   element: HTMLElement,
 *   stage: HTMLElement,
 *   activate: () => void,
 *   dispose: () => void,
 * }} Shell handle. Insert `element`, then call `activate()`.
 */
export function createShell() {
  return createTile();
}
