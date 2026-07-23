/**
 * Tile component — a simple resizable, themeable card that stays
 * centered in the body. Future scenes/figures mount inside it.
 */

import { clamp } from '../utils/helpers.js';
import {
  SUN_ICON,
  MOON_ICON,
  CHEVRON_DOWN_ICON,
  SPARKLES_ICON,
} from '../utils/icons.js';

const MIN_SIZE_RATIO = 0.5;
const MAX_SIZE_RATIO = 0.95;
const INITIAL_SIZE_RATIO = 0.7;

const SIZE_PRESETS = [
  { value: 'max', label: 'Максимум (95%)', ratio: MAX_SIZE_RATIO },
  { value: 'half', label: '50%', ratio: 0.5 },
  { value: 'min', label: 'Минимум', ratio: MIN_SIZE_RATIO },
];

const HANDLE_CONFIG = [
  { position: 'top', cursor: 'ns-resize', horizontal: 0, vertical: -1 },
  { position: 'bottom', cursor: 'ns-resize', horizontal: 0, vertical: 1 },
  { position: 'left', cursor: 'ew-resize', horizontal: -1, vertical: 0 },
  { position: 'right', cursor: 'ew-resize', horizontal: 1, vertical: 0 },
  {
    position: 'top-left',
    cursor: 'nwse-resize',
    horizontal: -1,
    vertical: -1,
  },
  {
    position: 'top-right',
    cursor: 'nesw-resize',
    horizontal: 1,
    vertical: -1,
  },
  {
    position: 'bottom-left',
    cursor: 'nesw-resize',
    horizontal: -1,
    vertical: 1,
  },
  {
    position: 'bottom-right',
    cursor: 'nwse-resize',
    horizontal: 1,
    vertical: 1,
  },
];

/**
 * Create the tile element
 * @returns {HTMLDivElement} Tile element with toolbar and resize handles
 */
export function createTile() {
  const tile = document.createElement('div');
  tile.className = 'tile';
  tile.dataset.theme = 'light';

  const toolbar = createToolbar(tile);
  const emptyState = createEmptyState();

  tile.append(toolbar, emptyState);

  HANDLE_CONFIG.forEach((config) => {
    const handle = createHandle(config);
    tile.appendChild(handle);
    attachDrag(handle, tile, config);
  });

  applySizeRatio(tile, INITIAL_SIZE_RATIO);
  window.addEventListener('resize', () => reclampToBounds(tile));

  return tile;
}

/**
 * Create the toolbar holding the theme toggle and the size dropdown
 * @param {HTMLElement} tile - Tile element the toolbar controls
 * @returns {HTMLDivElement} Toolbar element
 */
function createToolbar(tile) {
  const toolbar = document.createElement('div');
  toolbar.className = 'tile__toolbar';

  toolbar.append(createThemeToggle(tile), createSizeSelect(tile));

  return toolbar;
}

/**
 * Create the light/dark theme toggle button
 * @param {HTMLElement} tile - Tile element to theme
 * @returns {HTMLButtonElement} Theme toggle button
 */
function createThemeToggle(tile) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'tile__icon-button';
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
 * Create the quick size-preset dropdown
 * @param {HTMLElement} tile - Tile element to resize
 * @returns {HTMLDivElement} Size select wrapper element
 */
function createSizeSelect(tile) {
  const wrapper = document.createElement('div');
  wrapper.className = 'tile__select-wrapper';

  const select = document.createElement('select');
  select.className = 'tile__select';
  select.setAttribute('aria-label', 'Resize tile');

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Размер';
  placeholder.disabled = true;
  placeholder.selected = true;
  select.appendChild(placeholder);

  SIZE_PRESETS.forEach((preset) => {
    const option = document.createElement('option');
    option.value = preset.value;
    option.textContent = preset.label;
    select.appendChild(option);
  });

  select.addEventListener('change', () => {
    const preset = SIZE_PRESETS.find((item) => item.value === select.value);

    if (preset) {
      applySizeRatio(tile, preset.ratio);
    }

    select.value = '';
  });

  const arrow = document.createElement('span');
  arrow.className = 'tile__select-arrow';
  arrow.innerHTML = CHEVRON_DOWN_ICON;

  wrapper.append(select, arrow);

  return wrapper;
}

/**
 * Create the centered empty-state hint shown before a scene is mounted
 * @returns {HTMLDivElement} Empty-state element
 */
function createEmptyState() {
  const emptyState = document.createElement('div');
  emptyState.className = 'tile__empty';

  const icon = document.createElement('span');
  icon.className = 'tile__empty-icon';
  icon.innerHTML = SPARKLES_ICON;

  const text = document.createElement('p');
  text.className = 'tile__empty-text';
  text.textContent = 'Здесь появится анимация';

  emptyState.append(icon, text);

  return emptyState;
}

/**
 * Create a resize handle for one edge or corner
 * @param {{ position: string, cursor: string }} config - Handle configuration
 * @returns {HTMLDivElement} Handle element
 */
function createHandle(config) {
  const handle = document.createElement('div');
  handle.className = `tile__handle tile__handle--${config.position}`;
  handle.style.cursor = config.cursor;
  return handle;
}

/**
 * Get the area available for the tile (its parent container)
 * @param {HTMLElement} tile - Tile element
 * @returns {{ width: number, height: number }} Available width and height
 */
function getAvailableBounds(tile) {
  const parent = tile.parentElement;

  if (!parent) {
    return { width: window.innerWidth, height: window.innerHeight };
  }

  return {
    width: parent.clientWidth,
    height: parent.clientHeight,
  };
}

/**
 * Size the tile at a given ratio of the available bounds, clamped
 * @param {HTMLElement} tile - Tile element
 * @param {number} ratio - Fraction of the available bounds (0-1)
 */
function applySizeRatio(tile, ratio) {
  const bounds = getAvailableBounds(tile);
  const width = clamp(
    bounds.width * ratio,
    bounds.width * MIN_SIZE_RATIO,
    bounds.width * MAX_SIZE_RATIO
  );
  const height = clamp(
    bounds.height * ratio,
    bounds.height * MIN_SIZE_RATIO,
    bounds.height * MAX_SIZE_RATIO
  );

  tile.style.width = `${width}px`;
  tile.style.height = `${height}px`;
}

/**
 * Re-clamp the current tile size after the viewport changes
 * @param {HTMLElement} tile - Tile element
 */
function reclampToBounds(tile) {
  const bounds = getAvailableBounds(tile);

  tile.style.width = `${clamp(
    tile.offsetWidth,
    bounds.width * MIN_SIZE_RATIO,
    bounds.width * MAX_SIZE_RATIO
  )}px`;
  tile.style.height = `${clamp(
    tile.offsetHeight,
    bounds.height * MIN_SIZE_RATIO,
    bounds.height * MAX_SIZE_RATIO
  )}px`;
}

/**
 * Wire up pointer-drag resizing for a handle
 * @param {HTMLElement} handle - Handle element that starts the drag
 * @param {HTMLElement} tile - Tile element being resized
 * @param {{ horizontal: number, vertical: number }} config - Signed axis
 *   multipliers the handle controls (-1, 0 or 1 per axis)
 */
function attachDrag(handle, tile, config) {
  handle.addEventListener('pointerdown', (event) => {
    event.preventDefault();

    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = tile.offsetWidth;
    const startHeight = tile.offsetHeight;

    handle.setPointerCapture(event.pointerId);
    tile.classList.add('tile--resizing');
    handle.classList.add('tile__handle--active');

    function onPointerMove(moveEvent) {
      const bounds = getAvailableBounds(tile);

      if (config.horizontal !== 0) {
        const deltaWidth = (moveEvent.clientX - startX) * 2 * config.horizontal;
        tile.style.width = `${clamp(
          startWidth + deltaWidth,
          bounds.width * MIN_SIZE_RATIO,
          bounds.width * MAX_SIZE_RATIO
        )}px`;
      }

      if (config.vertical !== 0) {
        const deltaHeight = (moveEvent.clientY - startY) * 2 * config.vertical;
        tile.style.height = `${clamp(
          startHeight + deltaHeight,
          bounds.height * MIN_SIZE_RATIO,
          bounds.height * MAX_SIZE_RATIO
        )}px`;
      }
    }

    function onPointerUp(upEvent) {
      handle.releasePointerCapture(upEvent.pointerId);
      tile.classList.remove('tile--resizing');
      handle.classList.remove('tile__handle--active');
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    }

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  });
}
