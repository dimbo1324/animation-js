/**
 * Model template. Copy this folder to `src/models/<model-id>/` and rename.
 *
 * Then register it in two places and nothing else:
 *   - `src/models/index.js`   — import the manifest, add it to MANIFESTS
 *   - `src/models/models.css` — one `@import` for the stylesheet
 *
 * This folder is intentionally not registered. It is a starting point, not
 * a running model.
 *
 * The shape to keep:
 *   onMount   builds nodes into `this.root` and nothing outside it
 *   onUpdate  moves numbers, never the DOM
 *   onRender  writes those numbers, never measures
 *   onResize  recomputes anything derived from the stage size
 *   onDestroy releases what `onMount` took
 *
 * Multiply every length by `this.renderScale` and the figure fits any tile
 * it is given.
 */

import { Model, element } from '../../core/index.js';
import { manifest } from './manifest.js';

const SPEED = 120;
const SIZE = 64;

export default class TemplateModel extends Model {
  static id = manifest.id;
  static title = manifest.title;
  static naturalSize = manifest.naturalSize;
  static fitRange = manifest.fitRange;

  #figure = null;
  #scale = 1;

  /**
   * Entity state. Allocated once, mutated in place — never re-created per
   * frame, and never read back out of the DOM.
   */
  #entity = { x: 0, y: 0, velocityX: SPEED };

  onMount() {
    this.#figure = element('div', 'model-template__figure');
    this.root.append(this.#figure);
  }

  onUpdate(dt) {
    const entity = this.#entity;
    const span = this.viewport.width - SIZE * this.#scale;

    entity.x += entity.velocityX * this.#scale * dt;

    if (entity.x > span || entity.x < 0) {
      entity.velocityX = -entity.velocityX;
      entity.x = Math.min(Math.max(entity.x, 0), span);
    }
  }

  onRender() {
    const { x, y } = this.#entity;

    this.#figure.style.transform =
      `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) `
      + `scale(${this.#scale.toFixed(3)})`;
  }

  onResize() {
    this.#scale = this.renderScale;
    this.#entity.y = (this.viewport.height - SIZE * this.#scale) / 2;
  }

  onDestroy() {
    this.#figure = null;
  }
}
