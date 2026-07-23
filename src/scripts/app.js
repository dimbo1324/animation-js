/**
 * Application initialization and core logic
 */

import { createTile } from '../components/Tile.js';

/**
 * Initialize the application
 */
export function initializeApp() {
  const app = document.getElementById('app');

  if (!app) {
    console.error('App container not found');
    return;
  }

  const tile = createTile();
  app.appendChild(tile);

  console.log('Application initialized');
}
