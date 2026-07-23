/**
 * Button component
 */

/**
 * Create a button element
 * @param {string} text - Button text
 * @param {Function} onClick - Click handler
 * @returns {HTMLButtonElement} Button element
 */
export function createButton(text, onClick) {
  const button = document.createElement('button');
  button.textContent = text;
  button.className = 'button';

  if (onClick) {
    button.addEventListener('click', onClick);
  }

  return button;
}

/**
 * Add styles for button component
 */
export function initializeButtonStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .button {
      padding: 0.5rem 1rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      background-color: #f5f5f5;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.2s ease-out;
    }

    .button:hover {
      background-color: #e0e0e0;
      border-color: #999;
    }

    .button:active {
      transform: scale(0.98);
    }

    @media (prefers-color-scheme: dark) {
      .button {
        background-color: #333;
        border-color: #555;
        color: #e0e0e0;
      }

      .button:hover {
        background-color: #444;
        border-color: #777;
      }
    }
  `;

  document.head.appendChild(style);
}
