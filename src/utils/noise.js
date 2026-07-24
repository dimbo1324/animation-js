/**
 * Smooth deterministic noise.
 *
 * A sum of incommensurable sines: continuous, cheap, allocation-free, and
 * repeatable for a given seed. Used for the slow organic wobble that keeps
 * a creature from looking like a rigid shape.
 */

const TAU = Math.PI * 2;
const OCTAVES = [
  { frequency: 1, amplitude: 0.55 },
  { frequency: 1.618, amplitude: 0.3 },
  { frequency: 2.718, amplitude: 0.15 },
];

/**
 * Build a noise function.
 * @param {number} seed - Any number. The same seed gives the same wave.
 * @returns {(t: number) => number} Noise in roughly -1..1.
 */
export function createNoise(seed) {
  const phases = OCTAVES.map(
    (_octave, index) => (seed * (index + 3) * 12.9898) % TAU,
  );

  return (t) => {
    let total = 0;

    for (let i = 0; i < OCTAVES.length; i += 1) {
      total +=
        Math.sin(t * OCTAVES[i].frequency + phases[i])
        * OCTAVES[i].amplitude;
    }

    return total;
  };
}
