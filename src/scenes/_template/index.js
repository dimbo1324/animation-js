/**
 * Scene template. Copy this folder to `src/scenes/<scene-id>/` and rename.
 *
 * Then register it in two places and nothing else:
 *   - `src/scenes/index.js`  — the lazy loader
 *   - `src/scenes/scenes.css` — the stylesheet import
 *
 * This folder is intentionally not registered. It is a starting point, not
 * a running scene.
 */

import { Scene, element } from '../../core/index.js';

export default class TemplateScene extends Scene {
  static id = 'template';
  static title = 'Шаблон сцены';

  #figure = null;
  #bounds = { width: 0, height: 0 };

  /**
   * Entity state. Allocated once, mutated in place — never re-created per
   * frame, and never read back out of the DOM.
   */
  #entity = {
    x: 0,
    y: 0,
    velocityX: 120,
  };

  onMount() {
    this.#figure = element('div', 'scene-template__figure');
    this.root.append(this.#figure);
  }

  onUpdate(dt) {
    const entity = this.#entity;

    entity.x += entity.velocityX * dt;

    if (entity.x > this.#bounds.width || entity.x < 0) {
      entity.velocityX = -entity.velocityX;
    }
  }

  onRender() {
    const { x, y } = this.#entity;

    this.#figure.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }

  onResize(size) {
    this.#bounds = size;
  }

  onDestroy() {
    this.#figure = null;
  }
}
