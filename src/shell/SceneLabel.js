/**
 * The left half of the toolbar: what is currently on stage.
 *
 * Gives the toolbar something to be about, so the bar reads as a header
 * strip rather than a row of floating buttons.
 */

import { effect, element } from '../core/index.js';
import { CLAPPERBOARD_ICON } from '../utils/icons.js';
import { shellState } from './state.js';

const EMPTY_LABEL = 'Сцена не выбрана';

/**
 * Create the scene label.
 * @returns {{ element: HTMLElement, dispose: () => void }} Widget.
 */
export function createSceneLabel() {
  const icon = element('span', 'tile__label-icon');

  icon.innerHTML = CLAPPERBOARD_ICON;

  const text = element('span', 'tile__label-text');
  const wrapper = element('div', 'tile__label', icon, text);

  wrapper.setAttribute('aria-live', 'polite');

  const stopEffect = effect(() => {
    const title = shellState.sceneTitle;

    text.textContent = title ?? EMPTY_LABEL;
    wrapper.classList.toggle('tile__label--empty', title === null);
  });

  return { element: wrapper, dispose: stopEffect };
}
