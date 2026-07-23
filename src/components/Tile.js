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
  MAXIMIZE_ICON,
  MINIMIZE_ICON,
} from '../utils/icons.js';

const MIN_SIZE_RATIO = 0.5;
const MAX_SIZE_RATIO = 0.95;
const INITIAL_SIZE_RATIO = 0.7;
const SNAP_TOLERANCE_PX = 1;

const SIZE_PRESETS = [
  {
    value: 'max',
    label: 'Максимум',
    icon: MAXIMIZE_ICON,
    ratio: MAX_SIZE_RATIO,
  },
  {
    value: 'min',
    label: 'Минимум',
    icon: MINIMIZE_ICON,
    ratio: MIN_SIZE_RATIO,
  },
];

const HANDLE_CONFIG = [
  {
    position: 'top',
    axis: 'vertical',
    cursor: 'ns-resize',
    horizontal: 0,
    vertical: -1,
  },
  {
    position: 'bottom',
    axis: 'vertical',
    cursor: 'ns-resize',
    horizontal: 0,
    vertical: 1,
  },
  {
    position: 'left',
    axis: 'horizontal',
    cursor: 'ew-resize',
    horizontal: -1,
    vertical: 0,
  },
  {
    position: 'right',
    axis: 'horizontal',
    cursor: 'ew-resize',
    horizontal: 1,
    vertical: 0,
  },
  {
    position: 'top-left',
    axis: 'corner',
    cursor: 'nwse-resize',
    horizontal: -1,
    vertical: -1,
  },
  {
    position: 'top-right',
    axis: 'corner',
    cursor: 'nesw-resize',
    horizontal: 1,
    vertical: -1,
  },
  {
    position: 'bottom-left',
    axis: 'corner',
    cursor: 'nesw-resize',
    horizontal: -1,
    vertical: 1,
  },
  {
    position: 'bottom-right',
    axis: 'corner',
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

  toolbar.append(createThemeToggle(tile), createSizeDropdown(tile));

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
 * Create the quick size-preset dropdown (custom, not a native select)
 * @param {HTMLElement} tile - Tile element to resize
 * @returns {HTMLDivElement} Dropdown wrapper element
 */
function createSizeDropdown(tile) {
  const wrapper = document.createElement('div');
  wrapper.className = 'tile__dropdown';

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'tile__dropdown-trigger';
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');

  const triggerLabel = document.createElement('span');
  triggerLabel.className = 'tile__dropdown-label';
  triggerLabel.textContent = 'Размер';

  const triggerArrow = document.createElement('span');
  triggerArrow.className = 'tile__dropdown-arrow';
  triggerArrow.innerHTML = CHEVRON_DOWN_ICON;

  trigger.append(triggerLabel, triggerArrow);

  const menu = document.createElement('ul');
  menu.className = 'tile__dropdown-menu';
  menu.setAttribute('role', 'listbox');
  menu.hidden = true;

  const options = SIZE_PRESETS.map((preset) =>
    createSizeOption(preset, tile, wrapper)
  );
  menu.append(...options);

  wrapper.append(trigger, menu);

  trigger.addEventListener('click', () => {
    const willOpen = menu.hidden;

    if (willOpen) {
      updateOptionAvailability(tile, options);
    }

    menu.hidden = !willOpen;
    trigger.setAttribute('aria-expanded', String(willOpen));
    wrapper.classList.toggle('tile__dropdown--open', willOpen);
  });

  document.addEventListener('pointerdown', (event) => {
    if (!wrapper.contains(event.target)) {
      closeDropdown(wrapper, trigger, menu);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeDropdown(wrapper, trigger, menu);
    }
  });

  return wrapper;
}

/**
 * Create one option row for the size dropdown
 * @param {{ value: string, label: string, icon: string, ratio: number }} preset
 *   - Preset descriptor
 * @param {HTMLElement} tile - Tile element to resize
 * @param {HTMLElement} wrapper - Dropdown wrapper (used to close on select)
 * @returns {HTMLLIElement} Option element
 */
function createSizeOption(preset, tile, wrapper) {
  const option = document.createElement('li');
  option.className = 'tile__dropdown-option';
  option.dataset.value = preset.value;
  option.setAttribute('role', 'option');
  option.setAttribute('tabindex', '-1');

  const icon = document.createElement('span');
  icon.className = 'tile__dropdown-option-icon';
  icon.innerHTML = preset.icon;

  const label = document.createElement('span');
  label.textContent = preset.label;

  option.append(icon, label);

  option.addEventListener('click', () => {
    if (option.getAttribute('aria-disabled') === 'true') {
      return;
    }

    applySizeRatio(tile, preset.ratio);

    const trigger = wrapper.querySelector('.tile__dropdown-trigger');
    const menu = wrapper.querySelector('.tile__dropdown-menu');
    closeDropdown(wrapper, trigger, menu);
  });

  return option;
}

/**
 * Close the size dropdown menu
 * @param {HTMLElement} wrapper - Dropdown wrapper
 * @param {HTMLElement} trigger - Dropdown trigger button
 * @param {HTMLElement} menu - Dropdown menu list
 */
function closeDropdown(wrapper, trigger, menu) {
  menu.hidden = true;
  trigger.setAttribute('aria-expanded', 'false');
  wrapper.classList.remove('tile__dropdown--open');
}

/**
 * Grey out preset options that would have no effect at the tile's
 * current size
 * @param {HTMLElement} tile - Tile element
 * @param {HTMLElement[]} options - Rendered option elements
 */
function updateOptionAvailability(tile, options) {
  options.forEach((option) => {
    const preset = SIZE_PRESETS.find(
      (item) => item.value === option.dataset.value
    );
    const disabled = isAtRatio(tile, preset.ratio);

    option.classList.toggle('tile__dropdown-option--disabled', disabled);
    option.setAttribute('aria-disabled', String(disabled));
  });
}

/**
 * Check whether the tile is already sized at a given ratio
 * @param {HTMLElement} tile - Tile element
 * @param {number} ratio - Fraction of the available bounds (0-1)
 * @returns {boolean} True if the current size already matches the ratio
 */
function isAtRatio(tile, ratio) {
  const bounds = getAvailableBounds(tile);
  const targetWidth = clamp(
    bounds.width * ratio,
    bounds.width * MIN_SIZE_RATIO,
    bounds.width * MAX_SIZE_RATIO
  );
  const targetHeight = clamp(
    bounds.height * ratio,
    bounds.height * MIN_SIZE_RATIO,
    bounds.height * MAX_SIZE_RATIO
  );

  return (
    Math.abs(tile.offsetWidth - targetWidth) < SNAP_TOLERANCE_PX &&
    Math.abs(tile.offsetHeight - targetHeight) < SNAP_TOLERANCE_PX
  );
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
 * @param {{ position: string, axis: string, cursor: string }} config -
 *   Handle configuration
 * @returns {HTMLDivElement} Handle element
 */
function createHandle(config) {
  const handle = document.createElement('div');
  handle.className = `tile__handle tile__handle--${config.position}`;
  handle.dataset.axis = config.axis;
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

  const style = window.getComputedStyle(parent);
  const paddingX =
    parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  const paddingY =
    parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);

  return {
    width: parent.clientWidth - paddingX,
    height: parent.clientHeight - paddingY,
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
