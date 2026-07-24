/**
 * One creature: everything that changes over time, and nothing that draws.
 *
 * `update` advances springs, mood, blinking, and gaze. `render` reads the
 * settled values and hands them to the view. The two never swap jobs — that
 * split is what keeps simulation out of the DOM write pass.
 */

import { Spring } from '../../utils/Spring.js';
import { createNoise } from '../../utils/noise.js';
import {
  clamp,
  pickRandom,
  randomBetween,
  smoothstep,
  softCap,
} from '../../utils/math.js';
import { MOODS, MOOD_POOL } from './moods.js';
import { roundedOutline, sampleOutline } from './geometry.js';
import { CreatureView } from './CreatureView.js';

const SAMPLES = 56;
const UNIT = CreatureView.unit;
const FLOOR = 0.92;
const CROSS_EYE_CHANCE = 0.14;

export class Creature {
  #species;
  #base;
  #points;
  #noise;
  #drift;
  #springs;
  #eyes;
  #mood = 'calm';
  #moodTimer;
  #blinkTimer;
  #blink = 0;
  #blinking = false;
  #blinkPhase = 0;
  #blinkPlan = { close: 0.13, hold: 0.02, open: 0.16 };
  #lookTimer;
  #gaze = [0, 0];
  #crossEyed = false;
  #time;

  /**
   * @param {object} species - Entry from `SPECIES`.
   * @param {number} index - Position in the chain; seeds the noise.
   */
  constructor(species, index) {
    this.#species = species;
    this.#time = randomBetween(0, 100);
    this.#noise = createNoise(index * 7.3 + 1);
    this.#drift = createNoise(index * 3.1 + 11);

    this.#base = sampleOutline(
      roundedOutline(species.poly, species.radii),
      SAMPLES,
    );
    this.#points = this.#base.map(() => [0, 0]);

    this.#springs = {
      lid: new Spring(0.08, 70, 1),
      lowLid: new Spring(0, 70, 1),
      pupil: new Spring(1, 80, 0.9),
      curve: new Spring(0.16, 55, 0.85),
      open: new Spring(0.02, 60, 0.85),
      mouthWidth: new Spring(1, 55, 1),
      jelly: new Spring(0, 45, 0.55),
    };

    this.#eyes = species.eyes.map((eye, order) => ({
      def: eye,
      x: new Spring(0, 55 + order * 9, 0.78),
      y: new Spring(0, 55 + order * 9, 0.78),
      lag: 1 - order * 0.12,
    }));

    this.#moodTimer = randomBetween(1.5, 4);
    this.#blinkTimer = randomBetween(1, 4);
    this.#lookTimer = randomBetween(0.5, 2.5);

    this.view = new CreatureView(species, SAMPLES);
    this.#applyMood('happy', true);
  }

  /** @returns {object} The species definition. */
  get species() {
    return this.#species;
  }

  /**
   * Kick the body so it wobbles like jelly.
   * @param {number} strength - Impulse strength.
   */
  jolt(strength) {
    this.#springs.jelly.impulse(strength);
  }

  /**
   * Advance the creature.
   * @param {number} dt - Seconds since the previous update.
   * @param {[number, number] | null} lookAt - Unit-space point to watch, or
   *   `null` to let it look around on its own.
   */
  update(dt, lookAt) {
    this.#time += dt;

    this.#advanceMood(dt);
    this.#advanceBlink(dt);
    this.#advanceGaze(dt, lookAt);

    for (const key of Object.keys(this.#springs)) {
      this.#springs[key].step(dt);
    }
  }

  /**
   * Write the current state through the view.
   * @param {object} placement - Where the body sits this frame.
   * @param {number} placement.x - Horizontal centre in scene pixels.
   * @param {number} placement.groundY - Ground line in scene pixels.
   * @param {number} placement.lift - Hop height in pixels.
   * @param {number} placement.scale - Size multiplier.
   * @param {number} placement.lean - Rotation in degrees.
   */
  render(placement) {
    const { trait } = this.#species;
    const springs = this.#springs;
    const breath =
      Math.sin(this.#time * trait.breath * 1.7) * 0.5 + 0.5;
    const jelly = springs.jelly.value;

    const scaleY = 1 + breath * 0.02 + jelly * 0.03;
    const scaleX = 1 - breath * 0.014 - jelly * 0.026;
    const sag = trait.sag * (1 + jelly * 0.5);

    this.#deform(scaleX, scaleY, sag);
    this.view.drawBody(this.#points);

    const bodyY =
      placement.groundY
      - placement.lift
      - FLOOR * UNIT * placement.scale;

    this.view.place(
      placement.x,
      bodyY,
      placement.scale,
      placement.lean,
    );
    this.view.drawShadow(
      placement.x,
      placement.groundY,
      UNIT * 2 * placement.scale,
      placement.lift,
    );

    const faceY = (sag - 1) * 3 + breath * 1.4;

    this.view.placeFace(faceY, scaleX, scaleY);
    this.#renderEyes();
    this.#renderMouth(faceY);
  }

  #deform(scaleX, scaleY, sag) {
    const { trait } = this.#species;
    const t = this.#time;
    const drift = 0.012 * this.#drift(t * 0.32);

    for (let i = 0; i < SAMPLES; i += 1) {
      const source = this.#base[i];
      const wobble =
        1 + 0.02 * trait.wobble * this.#noise(i * 0.55 + t * 0.45);

      let x = source[0] * wobble * scaleX;
      let y = source[1] * wobble * scaleY;

      // The lower half carries the weight: it widens and settles, which is
      // what makes a primitive read as a soft bag rather than a shape.
      const low = smoothstep(-0.35, 0.95, y);

      x *= 1 + sag * 0.085 * low;
      y += sag * 0.055 * low;

      if (y > FLOOR) {
        y = FLOOR + softCap(y - FLOOR, 0.1);
      }

      x += drift * (1 - low * 0.6);

      this.#points[i][0] = x * UNIT;
      this.#points[i][1] = y * UNIT;
    }
  }

  #renderEyes() {
    const springs = this.#springs;
    const upper = clamp(
      Math.max(springs.lid.value, this.#blink),
      -0.15,
      1,
    );
    const lower = clamp(springs.lowLid.value * (1 - this.#blink), 0, 1);

    this.#eyes.forEach((eye, index) => {
      this.view.drawEye(index, {
        pupilX: eye.x.value * UNIT,
        pupilY: eye.y.value * UNIT,
        pupilScale: springs.pupil.value,
        upperLid: upper,
        lowerLid: lower,
      });
    });
  }

  #renderMouth(faceY) {
    const mouth = this.#species.mouth;
    const springs = this.#springs;

    this.view.drawMouth({
      x: mouth.x * UNIT + 1.4 * this.#drift(this.#time * 0.5),
      y: mouth.y * UNIT + faceY * 0.4,
      width: mouth.w * springs.mouthWidth.value * UNIT,
      curve: springs.curve.value * UNIT,
      open: springs.open.value * UNIT,
    });
  }

  #advanceMood(dt) {
    this.#moodTimer -= dt;

    if (this.#moodTimer > 0) {
      return;
    }

    const { trait } = this.#species;
    const bag = MOOD_POOL.slice();

    if (Math.random() < trait.drowsy) {
      bag.push('sleepy');
    }

    if (Math.random() < trait.curiosity) {
      bag.push('curious', 'happy');
    }

    let next = pickRandom(bag);

    if (next === this.#mood) {
      next = pickRandom(bag);
    }

    this.#applyMood(next, false);
    this.#moodTimer = randomBetween(4, 10);
  }

  #advanceBlink(dt) {
    if (!this.#blinking) {
      this.#blinkTimer -= dt;

      if (this.#blinkTimer <= 0) {
        this.#startBlink();
        this.#blinkTimer = randomBetween(...MOODS[this.#mood].blink);
      }

      return;
    }

    this.#blinkPhase += dt;

    const { close, hold, open } = this.#blinkPlan;
    const holdEnd = close + hold;
    const openEnd = holdEnd + open;

    if (this.#blinkPhase < close) {
      this.#blink = 1 - (1 - this.#blinkPhase / close) ** 3;
    } else if (this.#blinkPhase < holdEnd) {
      this.#blink = 1;
    } else if (this.#blinkPhase < openEnd) {
      this.#blink = 1 - (this.#blinkPhase - holdEnd) / open;
    } else {
      this.#blink = 0;
      this.#blinking = false;
    }
  }

  #advanceGaze(dt, lookAt) {
    const mood = MOODS[this.#mood];

    this.#lookTimer -= dt;

    if (lookAt !== null) {
      this.#gaze = lookAt;
      this.#crossEyed = false;
      this.#lookTimer = Math.max(this.#lookTimer, 0.25);
    } else if (this.#lookTimer <= 0) {
      this.#pickNewTarget(mood);
    }

    this.#eyes.forEach((eye) => this.#aimPupil(eye, mood, dt));
  }

  #pickNewTarget(mood) {
    const wide = this.#mood === 'curious' ? 1.3 : 0.8;

    this.#crossEyed = Math.random() < CROSS_EYE_CHANCE;
    this.#gaze = this.#crossEyed
      ? [0, 0.05]
      : [randomBetween(-1, 1) * wide, randomBetween(-0.7, 0.9) * wide];
    this.#lookTimer = randomBetween(...mood.look);
  }

  #aimPupil(eye, mood, dt) {
    const dx = this.#crossEyed
      ? -eye.def.x * 1.4
      : this.#gaze[0] - eye.def.x;
    const dy = this.#crossEyed ? 0.25 : this.#gaze[1] - eye.def.y;
    const length = Math.hypot(dx, dy) || 1;
    const reach = clamp(length / 1.1, 0, 1) * mood.gaze;
    const maxOffset =
      eye.def.r * (0.46 - 0.1 * (this.#springs.pupil.value - 1));

    eye.x.target = (dx / length) * maxOffset * reach * eye.lag;
    eye.y.target = (dy / length) * maxOffset * reach * eye.lag;
    eye.x.step(dt);
    eye.y.step(dt);
  }

  #startBlink() {
    this.#blinking = true;
    this.#blinkPhase = 0;
    this.#blinkPlan.close = randomBetween(0.11, 0.16);
    this.#blinkPlan.open = randomBetween(0.13, 0.2);
    this.#blinkPlan.hold =
      Math.random() < 0.12 ? randomBetween(0.15, 0.5) : 0.02;
  }

  #applyMood(name, instant) {
    const mood = MOODS[name];

    this.#mood = name;

    const targets = {
      lid: mood.lid,
      lowLid: mood.lowLid,
      pupil: mood.pupil,
      curve: mood.curve,
      open: mood.open,
      mouthWidth: mood.mouthWidth,
    };

    for (const [key, value] of Object.entries(targets)) {
      if (instant) {
        this.#springs[key].set(value);
      } else {
        this.#springs[key].target = value;
      }
    }

    this.#blinkTimer = Math.min(
      this.#blinkTimer,
      randomBetween(...mood.blink),
    );
  }
}
