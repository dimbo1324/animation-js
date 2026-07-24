/**
 * Scene manifest.
 *
 * One entry per animation. Loaders are dynamic imports, so a scene's code
 * is downloaded only when it is actually mounted — nothing is fetched while
 * the stage sits empty. Adding an animation means adding a line here and a
 * line in `scenes.css`; nothing else in the repository changes.
 */

import { registerScene } from '../core/index.js';

registerScene({
  id: 'creatures',
  title: 'Трое мешковатых',
  load: () => import('./creatures/index.js'),
});

/**
 * Scene the toolbar summons.
 *
 * Nothing is mounted on load: the stage starts empty on purpose, so the
 * demo never gets in the way of whatever is being built.
 */
export const DEMO_SCENE_ID = 'creatures';
