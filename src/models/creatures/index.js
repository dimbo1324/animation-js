/**
 * Creatures — three soft bodies running single file.
 *
 * The leader paces the stage; the other two replay its path a fixed delay
 * behind, which is what makes the chain hold its shape through every
 * turnaround without a line of steering code.
 *
 * Each creature is procedural all the way down: the silhouette is a rounded
 * primitive sampled into points, deformed every frame by breathing, weight,
 * and noise, then smoothed back into a path. Nothing here is a keyframe.
 *
 * `onUpdate` resolves every position, hop, and lean into `#state`.
 * `onRender` does nothing but write `#state` to the DOM.
 *
 * Every length below is authored for `manifest.naturalSize` and multiplied
 * by `renderScale` in the frame path, so the cast fits whatever stage it is
 * given instead of spilling off a small one.
 */

import {
  Model,
  prefersReducedMotion,
  svgElement,
} from '../../core/index.js';
import { clamp } from '../../utils/math.js';
import { Creature } from './Creature.js';
import { CreatureView } from './CreatureView.js';
import { manifest } from './manifest.js';
import { SPECIES } from './species.js';
import { Trail } from './Trail.js';

const RUN_SPEED = 128;
const FOLLOW_DELAY = 0.62;
const HOP_DISTANCE = 74;
const HOP_HEIGHT = 26;
const LEAN_DEGREES = 5;
const GROUND_RATIO = 0.8;
const EDGE_PADDING = 78;
const TRAIL_CAPACITY = 512;
const SCALES = [1, 0.9, 0.82];
const REST_SPACING = 130;
const POINTER_REACH = 6;
const POINTER_IDLE_LIMIT = 3.5;

export default class CreaturesModel extends Model {
  static id = manifest.id;
  static title = manifest.title;
  static naturalSize = manifest.naturalSize;
  static fitRange = manifest.fitRange;

  #svg = null;
  #creatures = [];
  #state = [];
  #trail = new Trail(TRAIL_CAPACITY);
  #sample = { x: 0, direction: 1 };
  #leader = { x: 0, direction: 1 };
  #time = 0;
  #range = 0;
  #groundY = 0;
  #scale = 1;
  #pointer = { x: 0, y: 0, active: false, idle: 999 };
  #reduced = false;

  onMount() {
    this.#reduced = prefersReducedMotion();
    this.#creatures = SPECIES.map(
      (species, index) => new Creature(species, index),
    );
    this.#state = this.#creatures.map((_creature, index) => ({
      x: (index - 1) * -REST_SPACING,
      previousX: (index - 1) * -REST_SPACING,
      direction: 1,
      travel: 0,
      lift: 0,
      lean: 0,
    }));

    const shadows = svgElement('g', {
      class: 'model-creatures__shadows',
    });
    const bodies = svgElement('g', {
      class: 'model-creatures__bodies',
    });

    for (const creature of this.#creatures) {
      shadows.append(creature.view.shadow);
      bodies.append(creature.view.group);
    }

    this.#svg = svgElement(
      'svg',
      {
        'class': 'model-creatures__stage',
        'role': 'img',
        'aria-label': 'Три существа бегут друг за другом',
      },
      shadows,
      bodies,
    );

    this.root.append(this.#svg);
  }

  onUpdate(dt) {
    this.#time += dt;
    this.#pointer.idle += dt;

    if (!this.#reduced) {
      this.#advanceLeader(dt);
      this.#trail.push(
        this.#time,
        this.#leader.x,
        this.#leader.direction,
      );
      this.#state.forEach((state, index) =>
        this.#resolveState(state, index),
      );
    }

    this.#creatures.forEach((creature, index) => {
      creature.update(dt, this.#lookVector(index));
    });
  }

  onRender() {
    const centreX = this.viewport.width / 2;
    const scale = this.#scale;

    for (let index = 0; index < this.#creatures.length; index += 1) {
      const state = this.#state[index];

      this.#creatures[index].render({
        x: centreX + state.x,
        groundY: this.#groundY,
        lift: state.lift,
        scale: SCALES[index] * scale,
        lean: state.lean,
      });
    }
  }

  onResize({ width, height }) {
    if (width === 0 || height === 0) {
      return;
    }

    // Cached once per resize on purpose: `renderScale` is derived from the
    // viewport, and the frame path must not recompute a constant three
    // times per frame.
    this.#scale = this.renderScale;

    this.#svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    this.#groundY = height * GROUND_RATIO;
    this.#range = Math.max(20, width / 2 - EDGE_PADDING * this.#scale);
    this.#leader.x = clamp(this.#leader.x, -this.#range, this.#range);

    // The path just changed shape, so every recorded position is a lie.
    this.#trail.clear();
  }

  onPointerMove(point) {
    this.#pointer.x = point.x;
    this.#pointer.y = point.y;
    this.#pointer.active = true;
    this.#pointer.idle = 0;
  }

  onPointerLeave() {
    this.#pointer.active = false;
  }

  onPointerDown() {
    for (const creature of this.#creatures) {
      creature.jolt(7.5);
    }
  }

  onDestroy() {
    this.#svg = null;
    this.#creatures = [];
    this.#state = [];
    this.#trail.clear();
  }

  #advanceLeader(dt) {
    const leader = this.#leader;

    leader.x += RUN_SPEED * this.#scale * leader.direction * dt;

    // Reflect the overshoot instead of snapping to the edge, so the
    // distance run stays identical at every frame rate.
    if (leader.x > this.#range) {
      leader.x = 2 * this.#range - leader.x;
      leader.direction = -1;
    } else if (leader.x < -this.#range) {
      leader.x = -2 * this.#range - leader.x;
      leader.direction = 1;
    }

    leader.x = clamp(leader.x, -this.#range, this.#range);
  }

  #resolveState(state, index) {
    if (index === 0) {
      state.x = this.#leader.x;
      state.direction = this.#leader.direction;
    } else if (
      this.#trail.sample(
        this.#time - index * FOLLOW_DELAY,
        this.#sample,
      )
    ) {
      state.x = this.#sample.x;
      state.direction = this.#sample.direction;
    }

    // Travel is the odometer each creature hops to. Followers retrace the
    // leader's path, so their hops come out naturally offset instead of
    // marching in lockstep.
    state.travel += Math.abs(state.x - state.previousX);
    state.previousX = state.x;

    const stride = HOP_DISTANCE * this.#scale;
    const hop = Math.abs(Math.sin((state.travel / stride) * Math.PI));

    state.lift =
      hop
      * HOP_HEIGHT
      * this.#scale
      * this.#creatures[index].species.trait.bounce;
    state.lean = state.direction * LEAN_DEGREES * (0.35 + hop * 0.65);
  }

  /**
   * Where creature `index` should look, in its own unit space.
   * @param {number} index - Creature index.
   * @returns {[number, number] | null} Gaze target, or null to look around.
   */
  #lookVector(index) {
    if (
      !this.#pointer.active
      || this.#pointer.idle > POINTER_IDLE_LIMIT
    ) {
      return null;
    }

    const state = this.#state[index];
    const unit = CreatureView.unit * SCALES[index] * this.#scale;
    const stageX = this.viewport.width / 2 + state.x;
    const stageY = this.#groundY - state.lift - unit;
    const dx = (this.#pointer.x - stageX) / unit;
    const dy = (this.#pointer.y - stageY) / unit;

    if (Math.hypot(dx, dy) > POINTER_REACH) {
      return null;
    }

    return [clamp(dx, -4, 4), clamp(dy, -4, 4)];
  }
}
