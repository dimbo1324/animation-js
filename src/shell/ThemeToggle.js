/**
 * Light/dark toggle for the tile.
 *
 * The button writes to shell state and nothing else; the icon it shows is
 * an effect of that state, not a consequence of the click. Any other code
 * path that changes the theme keeps the icon correct for free.
 */

import { effect } from '../core/index.js';
import { MOON_ICON, SUN_ICON } from '../utils/icons.js';
import { shellState, toggleTheme } from './state.js';

/**
 * Create the theme toggle button.
 * @returns {{ element: HTMLButtonElement, dispose: () => void }} Widget.
 */
export function createThemeToggle() {
  const button = document.createElement('button');

  button.type = 'button';
  button.className = 'tile__icon-button';
  button.addEventListener('click', toggleTheme);

  const stopEffect = effect(() => {
    const isDark = shellState.theme === 'dark';

    button.innerHTML = isDark ? SUN_ICON : MOON_ICON;
    button.setAttribute(
      'aria-label',
      isDark ? 'Включить светлую тему' : 'Включить тёмную тему',
    );
    button.setAttribute('aria-pressed', String(isDark));
  });

  return {
    element: button,

    dispose() {
      stopEffect();
      button.removeEventListener('click', toggleTheme);
    },
  };
}
