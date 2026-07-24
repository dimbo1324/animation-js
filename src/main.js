/**
 * Application entry point.
 *
 * The only file that knows about the shell, the engine, the scenes, and the
 * models at the same time. It wires them together and does nothing else.
 *
 * The order matters. The model's data sheet is read first and handed to the
 * shell, so the tile has already grown to fit the figure by the time the
 * figure is mounted — and the size is frozen while it runs.
 */

import { SceneHost, effect, loadScene, ticker } from './core/index.js';
import { createShell, setStageMin, shellState } from './shell/index.js';
import { DEMO_SCENE_ID } from './scenes/index.js';
import { DEMO_MODEL_ID, getModel, loadModel } from './models/index.js';

const container = document.getElementById('app');

if (container === null) {
  throw new Error(
    'main: #app container is missing from public/index.html',
  );
}

const shell = createShell();

container.append(shell.element);
shell.activate();

const demo = getModel(DEMO_MODEL_ID);

setStageMin(demo.minStage);

const host = new SceneHost(shell.stage, ticker);

async function syncScene(visible) {
  if (!visible) {
    host.unmount();
    shellState.sceneTitle = null;

    return;
  }

  const [SceneClass, ModelClass] = await Promise.all([
    loadScene(DEMO_SCENE_ID),
    loadModel(DEMO_MODEL_ID),
  ]);

  // The toggle may have been switched off again while the modules loaded.
  if (!shellState.sceneVisible) {
    return;
  }

  host.mount(SceneClass, { options: { model: ModelClass } });
  shellState.sceneTitle = demo.title;
}

const stopSceneSync = effect(() => {
  void syncScene(shellState.sceneVisible);
});

ticker.start();

window.addEventListener('pagehide', () => {
  ticker.stop();
  stopSceneSync();
  host.dispose();
  shell.dispose();
});
