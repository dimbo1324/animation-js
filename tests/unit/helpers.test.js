/**
 * Unit tests for helper functions
 */

import {
  clamp,
  lerp,
  normalize,
  easeInOutCubic,
} from '../../src/utils/helpers.js';

/**
 * Test clamp function
 */
function testClamp() {
  console.assert(clamp(5, 0, 10) === 5, 'clamp: value in range');
  console.assert(clamp(-5, 0, 10) === 0, 'clamp: value below min');
  console.assert(clamp(15, 0, 10) === 10, 'clamp: value above max');
}

/**
 * Test lerp function
 */
function testLerp() {
  console.assert(lerp(0, 10, 0) === 0, 'lerp: t=0');
  console.assert(lerp(0, 10, 1) === 10, 'lerp: t=1');
  console.assert(lerp(0, 10, 0.5) === 5, 'lerp: t=0.5');
}

/**
 * Test normalize function
 */
function testNormalize() {
  console.assert(normalize(5, 0, 10) === 0.5, 'normalize: middle value');
  console.assert(normalize(0, 0, 10) === 0, 'normalize: min value');
  console.assert(normalize(10, 0, 10) === 1, 'normalize: max value');
}

/**
 * Run all tests
 */
export function runTests() {
  console.log('Running helper function tests...');
  testClamp();
  testLerp();
  testNormalize();
  console.log('All tests passed!');
}
