/**
 * The general-purpose stage.
 *
 * It hosts one model and knows nothing else about it: it forwards frames,
 * forwards pointer input, and stays out of the way. Every figure in
 * `src/models/` runs here, so adding one never means writing a scene.
 *
 * The model class arrives already loaded, through `options.model`. Loading
 * belongs at the application edge, where the tile can be sized around the
 * figure before anything is mounted.
 *
 * The one job the scene does own is input. Pointer events arrive in client
 * coordinates; the model thinks in stage pixels. Converting takes the
 * stage's page offset, which is exactly what the host already measured and
 * published on `viewport` — so the conversion costs no layout read.
 */

import { ModelHost, Scene } from '../../core/index.js';

export default class ShowcaseScene extends Scene {
  static id = 'showcase';
  static title = 'Витрина';

  #models = null;
  #point = { x: 0, y: 0 };

  /** @returns {import('../../core/index.js').Model | null} Hosted model. */
  get model() {
    return this.#models?.model ?? null;
  }

  onMount() {
    this.#models = new ModelHost(this.root, this.host.viewport);

    const { model, modelOptions, scale } = this.options;

    if (model !== undefined) {
      this.#models.mount(model, { options: modelOptions, scale });
    }

    this.#bindPointer();
  }

  onUpdate(dt, elapsed) {
    this.#models.update(dt, elapsed);
  }

  onRender(alpha) {
    this.#models.render(alpha);
  }

  onDestroy() {
    this.#models.unmount();
    this.#models = null;
  }

  #bindPointer() {
    this.listen(
      this.root,
      'pointermove',
      (event) => {
        this.#models.pointer('move', this.#toStage(event));
      },
      { passive: true },
    );

    this.listen(this.root, 'pointerleave', () => {
      this.#models.pointer('leave');
    });

    this.listen(this.root, 'pointerdown', (event) => {
      this.#models.pointer('down', this.#toStage(event));
    });
  }

  #toStage(event) {
    const { left, top } = this.viewport;

    this.#point.x = event.clientX - left;
    this.#point.y = event.clientY - top;

    return this.#point;
  }
}
