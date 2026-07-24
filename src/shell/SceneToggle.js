/**
 * Summons the demo scene, or sends it away.
 *
 * The button owns no scene knowledge at all — it flips a flag in shell
 * state, and `main.js` is what mounts and unmounts. That is the seam that
 * lets the shell stay ignorant of `src/scenes/`.
 */

import { effect } from '../core/index.js';
import { GHOST_ICON, X_ICON } from '../utils/icons.js';
import { shellState, toggleScene } from './state.js';

/**
 * Create the scene toggle button.
 * @returns {{ element: HTMLButtonElement, dispose: () => void }} Widget.
 */
export function createSceneToggle() {
  const button = document.createElement('button');

  button.type = 'button';
  button.className = 'tile__icon-button tile__icon-button--accent';
  button.addEventListener('click', toggleScene);

  const stopEffect = effect(() => {
    const visible = shellState.sceneVisible;

    button.innerHTML = visible ? X_ICON : GHOST_ICON;
    button.setAttribute(
      'aria-label',
      visible ? 'Убрать существ со сцены' : 'Позвать существ на сцену',
    );
    button.setAttribute('aria-pressed', String(visible));
    button.classList.toggle('tile__icon-button--active', visible);
  });

  return {
    element: button,

    dispose() {
      stopEffect();
      button.removeEventListener('click', toggleScene);
    },
  };
}
