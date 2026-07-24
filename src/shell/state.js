/**
 * Reactive state of the shell.
 *
 * This is the single source of truth for how the tile looks and how big it
 * is. Nothing writes width, height, or theme to the DOM directly — widgets
 * mutate this object and effects project it onto the element. That is the
 * project's reactivity doctrine applied to the frame around the animation.
 */

import { reactive } from '../core/index.js';

export const THEMES = ['light', 'dark'];

export const shellState = reactive({
  /** Dark is the default. `public/index.html` ships the same value on
   *  `<html>` so the first paint is already correct. */
  theme: 'dark',
  width: 0,
  height: 0,
  /** Whether the demo scene is mounted. The stage starts empty. */
  sceneVisible: false,
  /** Title of the mounted scene, or `null`. Owned by `main.js`. */
  sceneTitle: null,
});

/** Swap between the light and dark themes. */
export function toggleTheme() {
  shellState.theme = shellState.theme === 'dark' ? 'light' : 'dark';
}

/** Show or hide the demo scene. `main.js` reacts by mounting it. */
export function toggleScene() {
  shellState.sceneVisible = !shellState.sceneVisible;
}

/**
 * Resize the tile.
 * @param {{ width: number, height: number }} size - New size in pixels.
 */
export function setSize({ width, height }) {
  shellState.width = width;
  shellState.height = height;
}
