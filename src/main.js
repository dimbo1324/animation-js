/**
 * Application entry point.
 *
 * The only file that knows about the shell, the engine, and the scenes at
 * the same time. It wires them together and does nothing else — every
 * behaviour lives in the module that owns it.
 *
 * The stage starts empty on purpose. A scene mounts only when the toolbar
 * asks for one, and the shell never learns which scene that is.
 */

import { SceneHost, effect, loadScene, ticker } from './core/index.js';
import { createShell, shellState } from './shell/index.js';
import { DEMO_SCENE_ID } from './scenes/index.js';

const container = document.getElementById('app');

if (container === null) {
  throw new Error(
    'main: #app container is missing from public/index.html',
  );
}

const shell = createShell();

container.append(shell.element);
shell.activate();

const host = new SceneHost(shell.stage, ticker);

async function syncScene(visible) {
  if (!visible) {
    host.unmount();
    shellState.sceneTitle = null;

    return;
  }

  const SceneClass = await loadScene(DEMO_SCENE_ID);

  // The toggle may have been switched off again while the module loaded.
  if (!shellState.sceneVisible) {
    return;
  }

  host.mount(SceneClass);
  shellState.sceneTitle = SceneClass.title;
}

const stopSceneSync = effect(() => {
  void syncScene(shellState.sceneVisible);
});

ticker.start();

window.addEventListener('pagehide', () => {
  ticker.stop();
  stopSceneSync();
  host.unmount();
  shell.dispose();
});
