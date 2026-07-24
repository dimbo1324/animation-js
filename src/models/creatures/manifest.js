/**
 * Data sheet for the creatures model.
 *
 * Everything the application needs to know *before* the model's code has
 * been downloaded lives here: what it is called, how much room it wants,
 * and how to fetch the rest of it. The class imports these numbers back,
 * so the sheet stays the single source of truth for them.
 */

export const manifest = {
  id: 'creatures',
  title: 'Трое мешковатых',

  /** The stage these three were drawn for. */
  naturalSize: { width: 560, height: 320 },

  /** They stay readable when small and get heavy when blown up. */
  fitRange: { min: 0.5, max: 1.35 },

  load: () => import('./index.js'),
};
