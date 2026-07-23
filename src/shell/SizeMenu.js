/**
 * Size preset dropdown.
 *
 * A custom listbox rather than a native `<select>`, because the options
 * carry icons and a disabled state that depends on the tile's current
 * size. Keyboard and screen-reader behaviour is therefore ours to provide:
 * arrow keys move, Enter and Space choose, Escape closes, focus returns to
 * the trigger.
 */

import { element } from '../core/index.js';
import {
  CHEVRON_DOWN_ICON,
  MAXIMIZE_ICON,
  MINIMIZE_ICON,
} from '../utils/icons.js';
import {
  MAX_SIZE_RATIO,
  MIN_SIZE_RATIO,
  matchesRatio,
  measureBounds,
  sizeForRatio,
} from './geometry.js';
import { setSize, shellState } from './state.js';

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

/**
 * Create the size preset dropdown.
 * @param {HTMLElement} tile - Tile the presets resize.
 * @returns {{ element: HTMLElement, dispose: () => void }} Widget.
 */
export function createSizeMenu(tile) {
  const wrapper = element('div', 'tile__dropdown');
  const trigger = createTrigger();
  const menu = element('ul', 'tile__dropdown-menu');

  menu.setAttribute('role', 'listbox');
  menu.setAttribute('aria-label', 'Размер плитки');
  menu.hidden = true;

  const options = SIZE_PRESETS.map((preset) =>
    createOption(preset, tile, close),
  );

  menu.append(...options);
  wrapper.append(trigger, menu);

  function isOpen() {
    return !menu.hidden;
  }

  function open() {
    refreshAvailability(tile, options);
    menu.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    wrapper.classList.add('tile__dropdown--open');
    focusOption(options, 0);
  }

  function close({ restoreFocus = false } = {}) {
    if (!isOpen()) {
      return;
    }

    menu.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    wrapper.classList.remove('tile__dropdown--open');

    if (restoreFocus) {
      trigger.focus();
    }
  }

  function onTriggerClick() {
    if (isOpen()) {
      close();
    } else {
      open();
    }
  }

  function onPointerDown(event) {
    if (!wrapper.contains(event.target)) {
      close();
    }
  }

  function onKeyDown(event) {
    if (!isOpen()) {
      return;
    }

    if (event.key === 'Escape') {
      close({ restoreFocus: true });

      return;
    }

    const step = { ArrowDown: 1, ArrowUp: -1 }[event.key];

    if (step !== undefined) {
      event.preventDefault();
      moveFocus(options, step);
    }
  }

  trigger.addEventListener('click', onTriggerClick);
  document.addEventListener('pointerdown', onPointerDown);
  document.addEventListener('keydown', onKeyDown);

  return {
    element: wrapper,

    dispose() {
      trigger.removeEventListener('click', onTriggerClick);
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    },
  };
}

function createTrigger() {
  const trigger = document.createElement('button');

  trigger.type = 'button';
  trigger.className = 'tile__dropdown-trigger';
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');

  const label = element('span', 'tile__dropdown-label');

  label.textContent = 'Размер';

  const arrow = element('span', 'tile__dropdown-arrow');

  arrow.innerHTML = CHEVRON_DOWN_ICON;
  trigger.append(label, arrow);

  return trigger;
}

function createOption(preset, tile, close) {
  const option = element('li', 'tile__dropdown-option');

  option.dataset.value = preset.value;
  option.setAttribute('role', 'option');
  option.setAttribute('tabindex', '-1');

  const icon = element('span', 'tile__dropdown-option-icon');

  icon.innerHTML = preset.icon;

  const label = document.createElement('span');

  label.textContent = preset.label;
  option.append(icon, label);

  function choose() {
    if (option.getAttribute('aria-disabled') === 'true') {
      return;
    }

    setSize(sizeForRatio(measureBounds(tile), preset.ratio));
    close({ restoreFocus: true });
  }

  option.addEventListener('click', choose);
  option.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      choose();
    }
  });

  return option;
}

function refreshAvailability(tile, options) {
  const bounds = measureBounds(tile);
  const size = { width: shellState.width, height: shellState.height };

  options.forEach((option, index) => {
    const disabled = matchesRatio(
      bounds,
      size,
      SIZE_PRESETS[index].ratio,
    );

    option.classList.toggle(
      'tile__dropdown-option--disabled',
      disabled,
    );
    option.setAttribute('aria-disabled', String(disabled));
  });
}

function focusOption(options, index) {
  options[index]?.focus();
}

function moveFocus(options, step) {
  const current = options.indexOf(document.activeElement);
  const next = (current + step + options.length) % options.length;

  focusOption(options, next);
}
