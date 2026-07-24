/**
 * A creature's SVG nodes, and the code that writes state onto them.
 *
 * This half never simulates: it reads the creature's already-computed
 * numbers and pushes them into attributes. Nothing here measures the DOM.
 */

import { svgElement } from '../../core/index.js';
import { smoothClosedPath } from './geometry.js';

const UNIT = 52;
const PUPIL_RATIO = 0.44;
const GLINT_RATIO = 0.3;

let instanceCount = 0;

export class CreatureView {
  #species;
  #pathScratch;

  /**
   * @param {object} species - Entry from `SPECIES`.
   * @param {number} sampleCount - Points on the outline.
   */
  constructor(species, sampleCount) {
    this.#species = species;
    this.#pathScratch = new Array(sampleCount + 1).fill('');

    instanceCount += 1;
    this.uid = instanceCount;

    this.defs = svgElement('defs');
    this.body = svgElement('path', { fill: species.color });
    this.face = svgElement('g');
    this.eyes = species.eyes.map((eye, index) =>
      this.#buildEye(eye, index),
    );
    this.mouth = svgElement('path', {
      'fill': '#141413',
      'stroke': '#141413',
      'stroke-width': 4,
      'stroke-linejoin': 'round',
      'stroke-linecap': 'round',
    });

    this.face.append(...this.eyes.map((eye) => eye.group), this.mouth);
    this.group = svgElement(
      'g',
      { class: 'creature' },
      this.defs,
      this.body,
      this.face,
    );
    this.shadow = svgElement('ellipse', {
      class: 'creature__shadow',
      rx: 40,
      ry: 7,
    });
  }

  /** @returns {number} Unit-to-pixel scale of the body geometry. */
  static get unit() {
    return UNIT;
  }

  /**
   * Place the whole creature.
   * @param {number} x - Horizontal centre in scene pixels.
   * @param {number} y - Vertical centre in scene pixels.
   * @param {number} scale - Size multiplier.
   * @param {number} lean - Rotation in degrees.
   */
  place(x, y, scale, lean) {
    this.group.setAttribute(
      'transform',
      `translate(${x.toFixed(1)} ${y.toFixed(1)}) `
        + `rotate(${lean.toFixed(2)}) scale(${scale.toFixed(3)})`,
    );
  }

  /**
   * Write the deformed outline.
   * @param {Array<[number, number]>} points - Outline points in pixels.
   */
  drawBody(points) {
    this.body.setAttribute(
      'd',
      smoothClosedPath(points, this.#pathScratch),
    );
  }

  /**
   * Place the ground shadow under the creature.
   * @param {number} x - Horizontal centre in scene pixels.
   * @param {number} groundY - Ground line in scene pixels.
   * @param {number} width - Body width in pixels.
   * @param {number} lift - Hop height, 0 on the ground.
   */
  drawShadow(x, groundY, width, lift) {
    const closeness = Math.max(0, 1 - lift / 60);

    this.shadow.setAttribute('cx', x.toFixed(1));
    this.shadow.setAttribute('cy', groundY.toFixed(1));
    this.shadow.setAttribute(
      'rx',
      (width * (0.34 + closeness * 0.16)).toFixed(1),
    );
    this.shadow.setAttribute('ry', (4 + closeness * 4).toFixed(1));
    this.shadow.setAttribute(
      'opacity',
      (0.06 + closeness * 0.16).toFixed(3),
    );
  }

  /**
   * Offset and squash the face so it rides with the body.
   * @param {number} offsetY - Vertical offset in pixels.
   * @param {number} scaleX - Horizontal squash.
   * @param {number} scaleY - Vertical stretch.
   */
  placeFace(offsetY, scaleX, scaleY) {
    this.face.setAttribute(
      'transform',
      `translate(0 ${offsetY.toFixed(2)}) scale(${scaleX.toFixed(4)} ${scaleY.toFixed(4)})`,
    );
  }

  /**
   * Draw one eye.
   * @param {number} index - Eye index.
   * @param {object} state - Pupil offset and lid coverage.
   */
  drawEye(index, state) {
    const node = this.eyes[index];
    const px = node.cx + state.pupilX;
    const py = node.cy + state.pupilY;
    const pr = node.r * PUPIL_RATIO * state.pupilScale;

    node.pupil.setAttribute('cx', px.toFixed(2));
    node.pupil.setAttribute('cy', py.toFixed(2));
    node.pupil.setAttribute('r', pr.toFixed(2));

    // The glint sits opposite the gaze, which is what makes a flat circle
    // read as a wet sphere.
    node.glint.setAttribute(
      'cx',
      (px - state.pupilX * 0.35 - pr * 0.34).toFixed(2),
    );
    node.glint.setAttribute(
      'cy',
      (py - state.pupilY * 0.35 - pr * 0.38).toFixed(2),
    );
    node.glint.setAttribute('r', (pr * GLINT_RATIO).toFixed(2));

    const span = node.r * 2 + 2;
    const lower = Math.max(0, state.lowerLid * node.r * 1.6);

    node.upperLid.setAttribute(
      'height',
      Math.max(0, state.upperLid * span + 1).toFixed(2),
    );
    node.lowerLid.setAttribute(
      'y',
      (node.cy + node.r - lower).toFixed(2),
    );
    node.lowerLid.setAttribute('height', lower.toFixed(2));
  }

  /**
   * Draw the mouth as a closed pair of quadratic curves.
   * @param {object} state - Centre, width, curvature and openness in pixels.
   */
  drawMouth(state) {
    const half = state.width / 2;
    const corner = state.y - state.curve * 0.22;
    const upper = state.y + state.curve * 0.85 - state.open * 0.3;
    const lower = state.y + state.curve * 0.85 + state.open * 0.85;
    const left = (state.x - half).toFixed(1);
    const right = (state.x + half).toFixed(1);
    const centre = state.x.toFixed(1);

    this.mouth.setAttribute(
      'd',
      `M${left} ${corner.toFixed(1)}`
        + `Q${centre} ${upper.toFixed(1)} ${right} ${corner.toFixed(1)}`
        + `Q${centre} ${lower.toFixed(1)} ${left} ${corner.toFixed(1)}Z`,
    );
  }

  #buildEye(eye, index) {
    const cx = eye.x * UNIT;
    const cy = eye.y * UNIT;
    const r = eye.r * UNIT;
    const clipId = `creature-eye-${this.uid}-${index}`;

    this.defs.append(
      svgElement(
        'clipPath',
        { id: clipId },
        svgElement('circle', { cx, cy, r }),
      ),
    );

    const pupil = svgElement('circle', {
      cx,
      cy,
      r: r * PUPIL_RATIO,
      fill: '#141413',
    });
    const glint = svgElement('circle', {
      cx,
      cy,
      r: r * 0.13,
      fill: '#ffffff',
    });

    const upperLid = svgElement('rect', {
      x: cx - r - 1,
      y: cy - r - 1,
      width: r * 2 + 2,
      height: 0,
      fill: this.#species.color,
    });
    const lowerLid = svgElement('rect', {
      x: cx - r - 1,
      y: cy + r,
      width: r * 2 + 2,
      height: 0,
      fill: this.#species.color,
    });

    const group = svgElement(
      'g',
      {},
      svgElement('circle', { cx, cy, r, fill: '#ffffff' }),
      pupil,
      glint,
      svgElement(
        'g',
        { 'clip-path': `url(#${clipId})` },
        upperLid,
        lowerLid,
      ),
    );

    return { group, pupil, glint, upperLid, lowerLid, cx, cy, r };
  }
}
