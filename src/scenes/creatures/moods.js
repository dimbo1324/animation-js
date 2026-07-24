/**
 * Moods.
 *
 * A mood is nothing but a set of spring targets, so switching moods can
 * never look like a cut — the face always travels there.
 */

export const MOODS = {
  calm: {
    lid: 0.08,
    lowLid: 0,
    pupil: 1,
    curve: 0.16,
    open: 0.02,
    mouthWidth: 1,
    blink: [2.6, 6.5],
    look: [2.2, 5],
    gaze: 0.55,
  },
  curious: {
    lid: 0,
    lowLid: 0,
    pupil: 1.18,
    curve: 0.08,
    open: 0.1,
    mouthWidth: 0.86,
    blink: [3, 7],
    look: [0.8, 2.2],
    gaze: 1,
  },
  happy: {
    lid: 0.04,
    lowLid: 0.3,
    pupil: 1.05,
    curve: 0.46,
    open: 0.22,
    mouthWidth: 1.12,
    blink: [2.2, 5],
    look: [1.4, 3.4],
    gaze: 0.8,
  },
  surprised: {
    lid: -0.1,
    lowLid: 0,
    pupil: 1.42,
    curve: -0.04,
    open: 0.62,
    mouthWidth: 0.6,
    blink: [4, 9],
    look: [0.5, 1.4],
    gaze: 1,
  },
  sleepy: {
    lid: 0.62,
    lowLid: 0.1,
    pupil: 0.88,
    curve: 0.04,
    open: 0.02,
    mouthWidth: 0.8,
    blink: [1.1, 3],
    look: [3.5, 8],
    gaze: 0.25,
  },
};

/**
 * Moods a running creature drifts between on its own. Weighted by
 * repetition — they are moving, so they are mostly alert and pleased.
 */
export const MOOD_POOL = [
  'happy',
  'happy',
  'curious',
  'curious',
  'calm',
];
