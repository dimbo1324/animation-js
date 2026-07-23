/**
 * Application initialization and core logic
 */

import { createStage } from '../components/Stage.js';

/**
 * Initialize the application
 */
export function initializeApp() {
  const app = document.getElementById('app');

  if (!app) {
    console.error('App container not found');
    return;
  }

  const stage = createStage();
  app.appendChild(stage);

  console.log('Application initialized');
}
