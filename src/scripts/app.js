/**
 * Application initialization and core logic
 */

/**
 * Initialize the application
 */
export function initializeApp() {
  const app = document.getElementById('app');

  if (!app) {
    console.error('App container not found');
    return;
  }

  app.innerHTML = '<h1>Welcome to Animation JS</h1>';
  console.log('Application initialized');
}
