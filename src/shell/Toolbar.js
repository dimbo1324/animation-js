/**
 * Tile toolbar: a header strip across the top of the card.
 *
 * It is visually its own surface, so the animation stage below it stays a
 * clean canvas with nothing floating over the artwork.
 */

import { element } from '../core/index.js';
import { createSceneLabel } from './SceneLabel.js';
import { createSceneToggle } from './SceneToggle.js';
import { createSizeMenu } from './SizeMenu.js';
import { createThemeToggle } from './ThemeToggle.js';

/**
 * Create the toolbar and its widgets.
 * @param {HTMLElement} tile - Tile the widgets control.
 * @returns {{ element: HTMLElement, dispose: () => void }} Toolbar.
 */
export function createToolbar(tile) {
  const label = createSceneLabel();
  const widgets = [
    createSceneToggle(),
    createThemeToggle(),
    createSizeMenu(tile),
  ];
  const actions = element(
    'div',
    'tile__toolbar-actions',
    ...widgets.map((widget) => widget.element),
  );
  const toolbar = element(
    'div',
    'tile__toolbar',
    label.element,
    actions,
  );

  toolbar.setAttribute('role', 'toolbar');
  toolbar.setAttribute('aria-label', 'Управление сценой');

  return {
    element: toolbar,

    dispose() {
      label.dispose();

      for (const widget of widgets) {
        widget.dispose();
      }
    },
  };
}
