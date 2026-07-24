/**
 * Size preset dropdown.
 *
 * A custom listbox rather than a native `<select>`, because the options
 * carry icons and a disabled state that depends on the tile's current
 * size. Keyboard and screen-reader behaviour is therefore ours to provide:
 * arrow keys move, Enter and Space choose, Escape closes, focus returns to
 * the trigger.
 *
 * The two presets are the ends of the range the tile is allowed to occupy.
 * "Максимум" is a fraction of the page, as it has always been. "Минимум"
 * is whatever the running model said it needs — so on a stage that has
 * been given a demanding figure, the smallest available tile is larger
 * than it used to be, and the figure still fits.
 */

import { effect, element } from '../core/index.js';
import {
  CHEVRON_DOWN_ICON,
  MAXIMIZE_ICON,
  MINIMIZE_ICON,
} from '../utils/icons.js';
import { matchesSize } from './geometry.js';
import { sizeLocked } from './state.js';

const LOCKED_HINT =
  'Размер плитки меняется только при остановленной анимации';

const SIZE_PRESETS = [
  { edge: 'max', label: 'Максимум', icon: MAXIMIZE_ICON },
  { edge: 'min', label: 'Минимум', icon: MINIMIZE_ICON },
];

/**
 * Create the size preset dropdown.
 * @param {object} sizing - The tile's sizing controller.
 * @returns {{ element: HTMLElement, dispose: () => void }} Widget.
 */
export function createSizeMenu(sizing) {
  const wrapper = element('div', 'tile__dropdown');
  const trigger = createTrigger();
  const menu = element('ul', 'tile__dropdown-menu');

  menu.setAttribute('role', 'listbox');
  menu.setAttribute('aria-label', 'Размер плитки');
  menu.hidden = true;

  const options = SIZE_PRESETS.map((preset) =>
    createOption(preset, sizing, close),
  );

  menu.append(...options);
  wrapper.append(trigger, menu);

  function isOpen() {
    return !menu.hidden;
  }

  function open() {
    refreshAvailability(sizing, options);
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

  const stopLockEffect = effect(() => {
    const locked = sizeLocked.value;

    trigger.disabled = locked;
    trigger.title = locked ? LOCKED_HINT : '';

    if (locked) {
      close();
    }
  });

  trigger.addEventListener('click', onTriggerClick);
  document.addEventListener('pointerdown', onPointerDown);
  document.addEventListener('keydown', onKeyDown);

  return {
    element: wrapper,

    dispose() {
      stopLockEffect();
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

function createOption(preset, sizing, close) {
  const option = element('li', 'tile__dropdown-option');

  option.dataset.value = preset.edge;
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

    sizing.applyEdge(preset.edge);
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

function refreshAvailability(sizing, options) {
  const limits = sizing.refresh();
  const size = sizing.current();

  options.forEach((option, index) => {
    const disabled = matchesSize(
      size,
      limits[SIZE_PRESETS[index].edge],
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
