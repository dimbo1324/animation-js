/**
 * Data sheet for the template model. Copy it with the folder.
 *
 * `naturalSize` is the contract with the shell: state the box the figure is
 * drawn for and the tile will refuse to shrink below it.
 */

export const manifest = {
  id: 'template',
  title: 'Шаблон модели',
  naturalSize: { width: 480, height: 320 },
  fitRange: { min: 0.5, max: 1.5 },
  load: () => import('./index.js'),
};
