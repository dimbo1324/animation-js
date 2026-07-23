# Architecture Guide

## Overview

This project follows a modular architecture pattern with high decomposition and distribution of concerns.

## Directory Structure

### `/src` - Source Code

Core application code organized by responsibility:

- **`/components`** - Reusable UI components
  - Each component is self-contained
  - Includes creation function and styling
  - Example: `Button.js`

- **`/scripts`** - Application logic and initialization
  - `main.js` - Entry point
  - `app.js` - Core application setup
  - Feature modules follow here

- **`/styles`** - Global and component styles
  - `main.css` - Global styles
  - Component-specific styles (in component files)

- **`/utils`** - Utility functions and helpers
  - Pure functions
  - No side effects
  - Examples: `helpers.js`

- **`/assets`** - Static resources
  - `images/` - Image files
  - `fonts/` - Font files
  - `icons/` - Icon files

### `/tests` - Testing

- **`/unit`** - Unit tests for individual functions
- **`/integration`** - Integration tests for features

### `/dist` - Build Output

Compiled and optimized code (generated, not committed)

### `/public` - Static Files

Files served directly:

- `index.html` - Main HTML entry point

### `/docs` - Documentation

Project documentation and guides

### `/config` - Configuration Files

Project configuration and build settings

## Principles

1. **Modularity** - Each file has a single responsibility
2. **Decomposition** - Complex logic is broken into smaller pieces
3. **Reusability** - Components and utilities are designed for reuse
4. **Clarity** - Clear naming and structure
5. **Testability** - Functions are pure and easy to test

## Module Pattern

Modules export functions and constants:

```javascript
export function featureName(params) {
  // Implementation
}

export const CONSTANT = 'value';
```

## Component Pattern

Components are simple functions that return DOM elements:

```javascript
export function createComponentName(props) {
  const element = document.createElement('div');
  // Setup element
  return element;
}

export function initializeComponentNameStyles() {
  // Add component styles
}
```

## Coding Style

- **Format**: Prettier (80 char width)
- **Indentation**: 2 spaces
- **Semicolons**: Always
- **Quotes**: Single quotes
- **Line Orientation**: Vertical (each significant element on new line)

## Getting Started

1. Install dependencies: `npm install`
2. Format code: `npm run format`
3. Run tests: Check `/tests` for test files
4. Build: Add build script as needed
