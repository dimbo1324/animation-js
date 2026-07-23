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
  theme: 'light',
  width: 0,
  height: 0,
});

/** Swap between the light and dark tile themes. */
export function toggleTheme() {
  shellState.theme = shellState.theme === 'dark' ? 'light' : 'dark';
}

/**
 * Resize the tile.
 * @param {{ width: number, height: number }} size - New size in pixels.
 */
export function setSize({ width, height }) {
  shellState.width = width;
  shellState.height = height;
}
