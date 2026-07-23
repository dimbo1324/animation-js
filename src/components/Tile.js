/**
 * Tile component — a simple resizable, themeable card that stays
 * centered in the body. Future scenes/figures mount inside it.
 */

import { clamp } from '../utils/helpers.js';
import { SUN_ICON, MOON_ICON, MOVE_DIAGONAL_ICON } from '../utils/icons.js';

const MIN_SIZE_RATIO = 0.5;
const MAX_SIZE_RATIO = 0.95;
const INITIAL_SIZE_RATIO = 0.7;

/**
 * Create the tile element
 * @returns {HTMLDivElement} Tile element with theme toggle and resize handles
 */
export function createTile() {
  const tile = document.createElement('div');
  tile.className = 'tile';
  tile.dataset.theme = 'light';

  const themeToggle = createThemeToggle(tile);
  const handleRight = createHandle('right', 'ew-resize');
  const handleBottom = createHandle('bottom', 'ns-resize');
  const handleCorner = createHandle('corner', 'nwse-resize');
  handleCorner.innerHTML = MOVE_DIAGONAL_ICON;

  tile.append(themeToggle, handleRight, handleBottom, handleCorner);

  applyInitialSize(tile);
  attachDrag(handleRight, tile, { horizontal: true, vertical: false });
  attachDrag(handleBottom, tile, { horizontal: false, vertical: true });
  attachDrag(handleCorner, tile, { horizontal: true, vertical: true });

  return tile;
}

/**
 * Create the light/dark theme toggle button
 * @param {HTMLElement} tile - Tile element to theme
 * @returns {HTMLButtonElement} Theme toggle button
 */
function createThemeToggle(tile) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'tile__theme-toggle';
  button.setAttribute('aria-label', 'Toggle tile theme');
  button.innerHTML = MOON_ICON;

  button.addEventListener('click', () => {
    const isDark = tile.dataset.theme === 'dark';
    tile.dataset.theme = isDark ? 'light' : 'dark';
    button.innerHTML = isDark ? MOON_ICON : SUN_ICON;
  });

  return button;
}

/**
 * Create a resize handle
 * @param {'right' | 'bottom' | 'corner'} position - Handle position
 * @param {string} cursor - CSS cursor to show on hover
 * @returns {HTMLDivElement} Handle element
 */
function createHandle(position, cursor) {
  const handle = document.createElement('div');
  handle.className = `tile__handle tile__handle--${position}`;
  handle.style.cursor = cursor;
  return handle;
}

/**
 * Get the area available for the tile (the body viewport)
 * @returns {{ width: number, height: number }} Available width and height
 */
function getAvailableBounds() {
  return {
    width: document.body.clientWidth,
    height: document.body.clientHeight,
  };
}

/**
 * Size the tile at its initial ratio, clamped to allowed bounds
 * @param {HTMLElement} tile - Tile element
 */
function applyInitialSize(tile) {
  const bounds = getAvailableBounds();
  tile.style.width = `${bounds.width * INITIAL_SIZE_RATIO}px`;
  tile.style.height = `${bounds.height * INITIAL_SIZE_RATIO}px`;
}

/**
 * Wire up pointer-drag resizing for a handle
 * @param {HTMLElement} handle - Handle element that starts the drag
 * @param {HTMLElement} tile - Tile element being resized
 * @param {{ horizontal: boolean, vertical: boolean }} axis - Which axes the
 *   handle controls
 */
function attachDrag(handle, tile, axis) {
  handle.addEventListener('pointerdown', (event) => {
    event.preventDefault();

    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = tile.offsetWidth;
    const startHeight = tile.offsetHeight;

    handle.setPointerCapture(event.pointerId);
    tile.classList.add('tile--resizing');

    function onPointerMove(moveEvent) {
      const bounds = getAvailableBounds();

      if (axis.horizontal) {
        const proposedWidth = startWidth + (moveEvent.clientX - startX) * 2;
        tile.style.width = `${clamp(
          proposedWidth,
          bounds.width * MIN_SIZE_RATIO,
          bounds.width * MAX_SIZE_RATIO
        )}px`;
      }

      if (axis.vertical) {
        const proposedHeight = startHeight + (moveEvent.clientY - startY) * 2;
        tile.style.height = `${clamp(
          proposedHeight,
          bounds.height * MIN_SIZE_RATIO,
          bounds.height * MAX_SIZE_RATIO
        )}px`;
      }
    }

    function onPointerUp(upEvent) {
      handle.releasePointerCapture(upEvent.pointerId);
      tile.classList.remove('tile--resizing');
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    }

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  });
}
