/**
 * Reactive state of the shell.
 *
 * This is the single source of truth for how the tile looks and how big it
 * is. Nothing writes width, height, or theme to the DOM directly — widgets
 * mutate this object and effects project it onto the element. That is the
 * project's reactivity doctrine applied to the frame around the animation.
 */

import { computed, reactive } from '../core/index.js';

export const THEMES = ['light', 'dark'];

export const shellState = reactive({
  /** Dark is the default. `public/index.html` ships the same value on
   *  `<html>` so the first paint is already correct. */
  theme: 'dark',
  width: 0,
  height: 0,
  /** Whether a scene is mounted. The stage starts empty. */
  sceneVisible: false,
  /** Title of the mounted scene, or `null`. Owned by `main.js`. */
  sceneTitle: null,
  /**
   * Stage the running animation needs, in pixels. Written by `main.js`
   * from the model's data sheet — the shell never learns which model that
   * is, only how much room it asked for.
   */
  stageMin: { width: 0, height: 0 },
});

/**
 * Whether the tile may be resized.
 *
 * Resizing while figures are moving means rebuilding their geometry
 * mid-stride: paths recorded against the old stage stop being true, and
 * the motion visibly resets. So the size is settled first and the
 * animation adapts to it — not the other way round.
 */
export const sizeLocked = computed(() => shellState.sceneVisible);

/** Swap between the light and dark themes. */
export function toggleTheme() {
  shellState.theme = shellState.theme === 'dark' ? 'light' : 'dark';
}

/** Show or hide the scene. `main.js` reacts by mounting it. */
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

/**
 * Declare how much stage the next animation needs.
 * @param {{ width: number, height: number }} size - Stage size in pixels.
 */
export function setStageMin({ width, height }) {
  shellState.stageMin = { width, height };
}
