import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

/**
 * Layout-forcing style writes. Allowed in the shell, where resizing is a
 * discrete user action; banned in the engine and in scenes, where anything
 * running per frame must stay on `transform` and `opacity`.
 */
const LAYOUT_PROPERTY_WRITE = {
  selector:
    'AssignmentExpression > MemberExpression[object.property.name="style"]'
    + '[property.name=/^(left|top|right|bottom|width|height|margin|padding|fontSize)$/]',
  message:
    'Layout properties force reflow. Animate transform/opacity instead '
    + '(see .ai/project/12-animation-performance.md).',
};

const TIMER_DRIVEN_ANIMATION = {
  selector: 'CallExpression[callee.name="setInterval"]',
  message:
    'setInterval does not drive animation here. Subscribe to the shared '
    + 'Ticker (src/core/Ticker.js).',
};

const PRIVATE_RAF_LOOP = {
  selector: 'CallExpression[callee.name="requestAnimationFrame"]',
  message:
    'One requestAnimationFrame loop per application. Subscribe to the '
    + 'shared Ticker instead of opening a private loop.',
};

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      'docs/__arch__/**',
    ],
  },

  js.configs.recommended,

  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
    },

    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },

    rules: {
      // Correctness
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-unused-private-class-members': 'error',
      'no-constant-binary-expression': 'error',
      'no-self-compare': 'error',
      'no-template-curly-in-string': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-unreachable-loop': 'error',
      'no-promise-executor-return': 'error',
      'require-atomic-updates': 'error',
      'no-return-assign': ['error', 'always'],
      'no-constructor-return': 'error',
      'consistent-return': 'error',
      'default-case-last': 'error',
      'eqeqeq': ['error', 'always', { null: 'ignore' }],

      // Hygiene
      'no-var': 'error',
      'prefer-const': 'error',
      'no-shadow': 'error',
      'no-param-reassign': ['error', { props: false }],
      'no-implicit-globals': 'error',
      'no-useless-rename': 'error',
      'no-useless-return': 'error',
      'no-useless-concat': 'error',
      'no-lonely-if': 'error',
      'no-nested-ternary': 'error',
      'no-else-return': ['error', { allowElseIf: false }],
      'curly': ['error', 'all'],
      'dot-notation': 'error',
      'radix': 'error',
      'yoda': 'error',

      // Modern idiom
      'object-shorthand': ['error', 'always'],
      'prefer-template': 'error',
      'prefer-object-spread': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-exponentiation-operator': 'error',
      'prefer-numeric-literals': 'error',
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'symbol-description': 'error',
      'grouped-accessor-pairs': ['error', 'getBeforeSet'],
      'func-style': [
        'error',
        'declaration',
        { allowArrowFunctions: true },
      ],

      // Decomposition
      'complexity': ['error', 14],
      'max-depth': ['error', 3],
      'max-params': ['error', 5],
      'max-lines': [
        'error',
        { max: 400, skipBlankLines: true, skipComments: true },
      ],
      'max-lines-per-function': [
        'error',
        { max: 90, skipBlankLines: true, skipComments: true },
      ],
      'max-nested-callbacks': ['error', 3],
    },
  },

  {
    files: ['src/core/**/*.js'],
    rules: {
      'no-restricted-syntax': [
        'error',
        LAYOUT_PROPERTY_WRITE,
        TIMER_DRIVEN_ANIMATION,
      ],
    },
  },

  {
    files: ['src/scenes/**/*.js', 'src/models/**/*.js'],
    rules: {
      'no-restricted-syntax': [
        'error',
        LAYOUT_PROPERTY_WRITE,
        TIMER_DRIVEN_ANIMATION,
        PRIVATE_RAF_LOOP,
      ],
    },
  },

  {
    files: ['scripts/**/*.{js,mjs}'],
    languageOptions: {
      globals: globals.nodeBuiltin,
    },
    rules: {
      'no-console': 'off',
    },
  },

  prettier,
];
