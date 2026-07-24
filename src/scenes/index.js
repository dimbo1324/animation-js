/**
 * Scene manifest.
 *
 * One entry per stage. Loaders are dynamic imports, so a scene's code is
 * downloaded only when it is actually mounted — nothing is fetched while
 * the stage sits empty.
 *
 * There is one scene, on purpose. A scene is the surface; the figures that
 * stand on it are models, and `showcase` hosts any of them. Add a scene
 * only when a surface needs behaviour of its own — parallax, several
 * models arranged together, a camera.
 */

import { registerScene } from '../core/index.js';

registerScene({
  id: 'showcase',
  title: 'Витрина',
  load: () => import('./showcase/index.js'),
});

/** Scene the toolbar mounts a model into. */
export const DEMO_SCENE_ID = 'showcase';
