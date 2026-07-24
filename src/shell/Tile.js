/**
 * The tile: a resizable, themeable card that hosts one animation.
 *
 * The tile knows nothing about what runs inside it. It exposes a `stage`
 * element and hands that over to the scene host; everything past that
 * boundary is the scene's business.
 *
 * Layout is a header strip plus a body: the toolbar is its own surface, so
 * nothing floats over the artwork.
 */

import { effect, element, write } from '../core/index.js';
import { SPARKLES_ICON } from '../utils/icons.js';
import { createResizeHandles } from './ResizeHandles.js';
import { createSizing } from './sizing.js';
import { createToolbar } from './Toolbar.js';
import { shellState, sizeLocked } from './state.js';

/**
 * Create the tile.
 *
 * The returned element must be inserted into the document before
 * `activate()` is called — sizing depends on the parent's measured bounds.
 *
 * @returns {{
 *   element: HTMLElement,
 *   stage: HTMLElement,
 *   activate: () => void,
 *   dispose: () => void,
 * }} Tile handle.
 */
export function createTile() {
  const tile = element('div', 'tile');
  const stage = element('div', 'tile__stage');
  const body = element('div', 'tile__body', stage, createEmptyState());
  const sizing = createSizing(tile, body);
  const toolbar = createToolbar(sizing);
  const handles = createResizeHandles(tile, sizing);

  tile.append(toolbar.element, body, ...handles.elements);

  const disposers = [
    toolbar.dispose,
    handles.dispose,
    sizing.dispose,
    // Written synchronously, not through `write()`. The theme attribute is
    // what resolves every colour token on the page, so deferring it to the
    // next frame would paint everything unstyled first. An attribute write
    // reads nothing, so there is no layout thrash to batch away.
    effect(() => {
      document.documentElement.dataset.theme = shellState.theme;
    }),
    effect(() => {
      tile.classList.toggle('tile--locked', sizeLocked.value);
    }),
    effect(() => {
      const { width, height } = shellState;

      if (width === 0 || height === 0) {
        return;
      }

      write(() => {
        tile.style.width = `${width}px`;
        tile.style.height = `${height}px`;
      });
    }),
  ];

  return {
    element: tile,
    stage,

    activate() {
      sizing.activate();
    },

    dispose() {
      for (const dispose of disposers) {
        dispose();
      }
    },
  };
}

function createEmptyState() {
  const icon = element('span', 'tile__empty-icon');

  icon.innerHTML = SPARKLES_ICON;

  const title = element('p', 'tile__empty-title');

  title.textContent = 'Сцена пуста';

  const hint = element('p', 'tile__empty-hint');

  hint.textContent = 'Позовите существ кнопкой в панели сверху';

  return element('div', 'tile__empty', icon, title, hint);
}
