/**
 * The cast.
 *
 * All coordinates are in unit space, roughly -1..1, Y pointing down. The
 * body is a rounded primitive; `trait` is what makes two creatures with the
 * same silhouette behave differently.
 *
 * - `sag` — how much the lower half settles under its own weight
 * - `breath` — breathing rate
 * - `wobble` — amplitude of the organic outline noise
 * - `curiosity` / `drowsy` — bias when picking the next mood
 * - `bounce` — hop height while running
 */

import { rectanglePoints } from './geometry.js';

export const SPECIES = [
  {
    id: 'baton',
    name: 'Батон',
    color: '#2ecb7d',
    shade: '#17a25c',
    poly: rectanglePoints(-0.56, -0.98, 1.12, 1.96),
    radii: [0.56, 0.56, 0.56, 0.56],
    eyes: [{ x: 0, y: -0.32, r: 0.4 }],
    mouth: { x: 0, y: 0.36, w: 0.34 },
    trait: {
      sag: 0.75,
      breath: 0.72,
      wobble: 1.3,
      curiosity: 1,
      drowsy: 0.1,
      bounce: 1.15,
    },
  },
  {
    id: 'bubble',
    name: 'Пузырь',
    color: '#ff5f97',
    shade: '#e0417c',
    poly: rectanglePoints(-0.9, -0.9, 1.8, 1.8),
    radii: [0.9, 0.9, 0.9, 0.9],
    eyes: [
      { x: -0.34, y: -0.1, r: 0.3 },
      { x: 0.34, y: -0.1, r: 0.3 },
    ],
    mouth: { x: 0, y: 0.44, w: 0.52 },
    trait: {
      sag: 1,
      breath: 0.55,
      wobble: 1,
      curiosity: 0.85,
      drowsy: 0.15,
      bounce: 1,
    },
  },
  {
    id: 'hill',
    name: 'Холмик',
    color: '#a95cff',
    shade: '#7b40d4',
    poly: rectanglePoints(-0.88, -0.86, 1.76, 1.8),
    radii: [0.88, 0.88, 0.22, 0.22],
    eyes: [
      { x: -0.44, y: -0.02, r: 0.21 },
      { x: 0, y: -0.24, r: 0.24 },
      { x: 0.44, y: -0.02, r: 0.21 },
    ],
    mouth: { x: 0, y: 0.46, w: 0.56 },
    trait: {
      sag: 1.6,
      breath: 0.38,
      wobble: 1.5,
      curiosity: 0.7,
      drowsy: 0.55,
      bounce: 0.78,
    },
  },
];
