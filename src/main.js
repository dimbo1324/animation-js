/**
 * Application entry point.
 *
 * The only file that knows about the shell, the engine, and the scenes at
 * the same time. It wires them together and does nothing else — every
 * behaviour lives in the module that owns it.
 */

import { SceneHost, loadScene, ticker } from './core/index.js';
import { createShell } from './shell/index.js';
import { DEFAULT_SCENE_ID } from './scenes/index.js';

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

host.mount(await loadScene(DEFAULT_SCENE_ID));
ticker.start();

window.addEventListener('pagehide', () => {
  ticker.stop();
  host.unmount();
  shell.dispose();
});
