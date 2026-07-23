/**
 * Tile toolbar: the controls that sit above the animation stage.
 */

import { element } from '../core/index.js';
import { createSizeMenu } from './SizeMenu.js';
import { createThemeToggle } from './ThemeToggle.js';

/**
 * Create the toolbar and its widgets.
 * @param {HTMLElement} tile - Tile the widgets control.
 * @returns {{ element: HTMLElement, dispose: () => void }} Toolbar.
 */
export function createToolbar(tile) {
  const toolbar = element('div', 'tile__toolbar');
  const widgets = [createThemeToggle(), createSizeMenu(tile)];

  toolbar.append(...widgets.map((widget) => widget.element));

  return {
    element: toolbar,

    dispose() {
      for (const widget of widgets) {
        widget.dispose();
      }
    },
  };
}
