/**
 * Scene manifest.
 *
 * One entry per animation. Loaders are dynamic imports, so a scene's code
 * is downloaded only when it is actually mounted. Adding an animation
 * means adding a line here and a line in `scenes.css` — nothing else in
 * the repository changes.
 */

import { registerScene } from '../core/index.js';

registerScene({
  id: 'walker',
  title: 'Прогулка',
  load: () => import('./walker/index.js'),
});

/** Scene mounted when the application starts. */
export const DEFAULT_SCENE_ID = 'walker';
