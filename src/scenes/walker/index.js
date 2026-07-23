/**
 * Walker — the reference scene.
 *
 * A small character pacing back and forth. It exists to demonstrate every
 * rule the project runs on, in the smallest honest example:
 *
 *   - one shared ticker, no private loop
 *   - simulation in `onUpdate`, DOM writes in `onRender`, never mixed
 *   - time-based motion, so the walk looks identical at 60 and 144 Hz
 *   - `transform` and `opacity` only; nothing in the frame path forces
 *     layout
 *   - entity state allocated once in `onMount` and mutated in place
 *   - reactive state for the discrete thing a human toggles (paused), the
 *     ticker for the continuous thing (motion)
 *
 * The motion itself follows the classic animation principles: the body
 * bounces, squashes on contact and stretches at the top, the head lags
 * behind the body, and the limbs swing in opposition.
 */

import {
  Scene,
  element,
  prefersReducedMotion,
} from '../../core/index.js';
import { easeInOutSine } from '../../utils/easing.js';
import { clamp, randomBetween } from '../../utils/math.js';

const WALK_SPEED = 90;
const STRIDE_RATE = 2.6;
const BOUNCE_HEIGHT = 14;
const HEAD_LAG = 0.35;
const LIMB_SWING = 34;
const BLINK_DURATION = 0.12;
const EDGE_PADDING = 90;

export default class WalkerScene extends Scene {
  static id = 'walker';
  static title = 'Прогулка';

  #parts = null;
  #range = 0;

  #walker = {
    x: 0,
    direction: 1,
    stridePhase: 0,
    bounce: 0,
    squash: 1,
    headTilt: 0,
    blink: 0,
    blinkCountdown: 3,
  };

  onMount() {
    this.#parts = buildFigure();
    this.root.append(this.#parts.actor);

    this.#makeInteractive();

    this.watch(() => {
      const { paused } = this.state;

      this.root.classList.toggle(
        'scene-walker--paused',
        paused === true,
      );
      this.root.setAttribute('aria-pressed', String(paused === true));
    });

    if (prefersReducedMotion()) {
      this.state.paused = true;
    }
  }

  onUpdate(dt) {
    if (this.state.paused === true) {
      return;
    }

    const walker = this.#walker;

    walker.x += WALK_SPEED * walker.direction * dt;

    // Reflect the overshoot rather than snapping to the edge. Snapping
    // throws away the part of the step past the boundary, which makes the
    // distance walked depend on the frame rate after enough turnarounds.
    if (walker.x > this.#range) {
      walker.x = 2 * this.#range - walker.x;
      walker.direction = -1;
    } else if (walker.x < -this.#range) {
      walker.x = -2 * this.#range - walker.x;
      walker.direction = 1;
    }

    walker.x = clamp(walker.x, -this.#range, this.#range);

    walker.stridePhase += STRIDE_RATE * Math.PI * dt;

    const step = Math.sin(walker.stridePhase);
    const lift = Math.abs(Math.sin(walker.stridePhase));

    walker.bounce = easeInOutSine(lift) * BOUNCE_HEIGHT;
    walker.squash = 1 + (0.5 - lift) * 0.14;
    walker.headTilt = step * 4;

    this.#updateBlink(dt);
  }

  onRender() {
    const walker = this.#walker;
    const parts = this.#parts;
    const step = Math.sin(walker.stridePhase);
    const squashY = walker.squash;
    const squashX = 2 - squashY;

    parts.actor.style.transform = `translate3d(${walker.x}px, 0, 0) scaleX(${walker.direction})`;

    parts.body.style.transform =
      `translate3d(0, ${-walker.bounce}px, 0) `
      + `scale(${squashX.toFixed(3)}, ${squashY.toFixed(3)})`;

    parts.head.style.transform =
      `translate3d(0, ${-walker.bounce * HEAD_LAG}px, 0) `
      + `rotate(${walker.headTilt.toFixed(2)}deg)`;

    parts.legFront.style.transform = `rotate(${(step * LIMB_SWING).toFixed(2)}deg)`;
    parts.legBack.style.transform = `rotate(${(-step * LIMB_SWING).toFixed(2)}deg)`;
    parts.armFront.style.transform = `rotate(${(-step * LIMB_SWING * 0.8).toFixed(2)}deg)`;
    parts.armBack.style.transform = `rotate(${(step * LIMB_SWING * 0.8).toFixed(2)}deg)`;

    const shadowScale = 1 - (walker.bounce / BOUNCE_HEIGHT) * 0.35;

    parts.shadow.style.transform = `scale(${shadowScale.toFixed(3)})`;
    parts.shadow.style.opacity = (shadowScale * 0.45).toFixed(3);

    const eyeScale = (1 - walker.blink).toFixed(3);

    parts.eyeLeft.style.transform = `scaleY(${eyeScale})`;
    parts.eyeRight.style.transform = `scaleY(${eyeScale})`;
  }

  onResize(size) {
    this.#range = Math.max(0, size.width / 2 - EDGE_PADDING);
    this.#walker.x = clamp(this.#walker.x, -this.#range, this.#range);
  }

  onDestroy() {
    this.#parts = null;
  }

  #updateBlink(dt) {
    const walker = this.#walker;

    walker.blinkCountdown -= dt;

    if (walker.blinkCountdown <= 0) {
      walker.blinkCountdown = randomBetween(2.5, 6);
      walker.blink = 1;
    }

    if (walker.blink > 0) {
      walker.blink = Math.max(0, walker.blink - dt / BLINK_DURATION);
    }
  }

  #makeInteractive() {
    const toggle = () => {
      this.state.paused = this.state.paused !== true;
    };

    this.root.tabIndex = 0;
    this.root.setAttribute('role', 'button');
    this.root.setAttribute(
      'aria-label',
      'Пауза и продолжение анимации',
    );

    this.listen(this.root, 'click', toggle);
    this.listen(this.root, 'keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggle();
      }
    });
  }
}

function buildFigure() {
  const eyeLeft = element(
    'span',
    'scene-walker__eye scene-walker__eye--left',
  );
  const eyeRight = element(
    'span',
    'scene-walker__eye scene-walker__eye--right',
  );
  const head = element(
    'div',
    'scene-walker__head',
    eyeLeft,
    eyeRight,
    element('span', 'scene-walker__mouth'),
  );

  const armBack = element(
    'div',
    'scene-walker__arm scene-walker__arm--back',
  );
  const armFront = element(
    'div',
    'scene-walker__arm scene-walker__arm--front',
  );
  const legBack = element(
    'div',
    'scene-walker__leg scene-walker__leg--back',
  );
  const legFront = element(
    'div',
    'scene-walker__leg scene-walker__leg--front',
  );

  const body = element(
    'div',
    'scene-walker__body',
    armBack,
    legBack,
    legFront,
    element('div', 'scene-walker__torso'),
    head,
    armFront,
  );

  const shadow = element('div', 'scene-walker__shadow');
  const actor = element('div', 'scene-walker__actor', shadow, body);

  return {
    actor,
    body,
    head,
    shadow,
    eyeLeft,
    eyeRight,
    armBack,
    armFront,
    legBack,
    legFront,
  };
}
