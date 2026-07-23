/**
 * Build configuration example
 * Copy and customize as needed for your build tool
 */

export const buildConfig = {
  input: 'src/scripts/main.js',
  output: 'dist/index.js',
  format: 'iife',
  minify: true,
  sourcemap: false,
  external: [],
  globals: {},
};

/**
 * Development server configuration
 */
export const devConfig = {
  port: 3000,
  host: 'localhost',
  open: true,
  watch: [
    'src/**/*.{js,css,html}',
    'public/**/*',
  ],
};

/**
 * Rollup plugin configuration (example)
 */
export const pluginConfig = {
  plugins: [
    // Add plugins as needed
    // Example: @rollup/plugin-node-resolve
    // Example: @rollup/plugin-commonjs
    // Example: rollup-plugin-terser
  ],
};
