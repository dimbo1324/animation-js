/**
 * The tile: a resizable, themeable card that hosts one animation.
 *
 * The tile knows nothing about what runs inside it. It exposes a `stage`
 * element and hands that over to the scene host; everything past that
 * boundary is the scene's business.
 */

import { effect, element, write } from '../core/index.js';
import { SPARKLES_ICON } from '../utils/icons.js';
import { createResizeHandles } from './ResizeHandles.js';
import { createToolbar } from './Toolbar.js';
import {
  INITIAL_SIZE_RATIO,
  clampSize,
  measureBounds,
  sizeForRatio,
} from './geometry.js';
import { setSize, shellState } from './state.js';

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
  const toolbar = createToolbar(tile);
  const handles = createResizeHandles(tile);

  tile.append(
    toolbar.element,
    stage,
    createEmptyState(),
    ...handles.elements,
  );

  const disposers = [
    toolbar.dispose,
    handles.dispose,
    // Written synchronously, not through `write()`. The theme attribute is
    // what resolves every colour token on the tile, so deferring it to the
    // next frame would paint the card unstyled first. An attribute write
    // reads nothing, so there is no layout thrash to batch away.
    effect(() => {
      tile.dataset.theme = shellState.theme;
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

  function onWindowResize() {
    const bounds = measureBounds(tile);

    setSize(clampSize(bounds, shellState.width, shellState.height));
  }

  return {
    element: tile,
    stage,

    activate() {
      setSize(sizeForRatio(measureBounds(tile), INITIAL_SIZE_RATIO));
      window.addEventListener('resize', onWindowResize);
    },

    dispose() {
      window.removeEventListener('resize', onWindowResize);

      for (const dispose of disposers) {
        dispose();
      }
    },
  };
}

function createEmptyState() {
  const empty = element('div', 'tile__empty');
  const icon = element('span', 'tile__empty-icon');

  icon.innerHTML = SPARKLES_ICON;

  const text = element('p', 'tile__empty-text');

  text.textContent = 'Здесь появится анимация';
  empty.append(icon, text);

  return empty;
}
