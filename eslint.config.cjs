const { fixupConfigRules } = require('@eslint/compat')
const { FlatCompat } = require('@eslint/eslintrc')
const js = require('@eslint/js')
const tsParser = require('@typescript-eslint/parser')
const checkFile = require('eslint-plugin-check-file')
// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
const storybook = require('eslint-plugin-storybook')
const { defineConfig, globalIgnores } = require('eslint/config')
const globals = require('globals')

const compat = new FlatCompat({
  allConfig: js.configs.all,
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
})

module.exports = defineConfig([
  {
    extends: compat.extends(
      'eslint:recommended',
      'next/core-web-vitals',
      'plugin:perfectionist/recommended-alphabetical-legacy',
    ),

    ignores: ['e2e/**'],

    languageOptions: {
      ecmaVersion: 'latest',

      globals: {
        ...globals.node,
      },
      parserOptions: {},
      sourceType: 'module',
    },
  },
  globalIgnores([
    'node_modules/*',
    'public/mockServiceWorker.js',
    'generators/*',
    '**/next-env.d.ts',
  ]),
  {
    extends: fixupConfigRules(
      compat.extends(
        'eslint:recommended',
        'plugin:import/typescript',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
        'plugin:testing-library/react',
        'plugin:jest-dom/recommended',
        'plugin:tailwindcss/recommended',
        'plugin:vitest/legacy-recommended',
      ),
    ),

    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['e2e/**'],

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },

      parser: tsParser,
    },

    rules: {
      '@next/next/no-img-element': 'off',
      '@typescript-eslint/explicit-function-return-type': ['off'],
      '@typescript-eslint/explicit-module-boundary-types': ['off'],
      '@typescript-eslint/no-empty-function': ['off'],
      '@typescript-eslint/no-explicit-any': ['off'],
      '@typescript-eslint/no-unused-vars': ['error'],
      'import/default': 'off',
      'import/no-cycle': 'error',
      'import/no-named-as-default': 'off',
      'import/no-named-as-default-member': 'off',

      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              except: ['./auth'],
              from: './src/features',
              target: './src/features/auth',
            },
            {
              except: ['./comments'],
              from: './src/features',
              target: './src/features/comments',
            },
            {
              except: ['./discussions'],
              from: './src/features',
              target: './src/features/discussions',
            },
            {
              except: ['./teams'],
              from: './src/features',
              target: './src/features/teams',
            },
            {
              except: ['./users'],
              from: './src/features',
              target: './src/features/users',
            },
            {
              from: './src/app',
              target: './src/features',
            },
            {
              from: ['./src/features', './src/app'],

              target: [
                './src/components',
                './src/hooks',
                './src/lib',
                './src/types',
                './src/utils',
              ],
            },
          ],
        },
      ],

      'import/order': [
        'error',
        {
          alphabetize: {
            caseInsensitive: true,
            order: 'asc',
          },

          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
          ],
          'newlines-between': 'always',
        },
      ],

      'jsx-a11y/anchor-is-valid': 'off',
      'linebreak-style': ['error', 'unix'],
      'perfectionist/sort-imports': 'off',

      'prettier/prettier': [
        'error',
        {},
        {
          usePrettierrc: true,
        },
      ],

      'react/no-unknown-property': [
        'error',
        {
          ignore: [
            'args',
            'castShadow',
            'intensity',
            'metalness',
            'position',
            'raycast',
            'receiveShadow',
            'rotation',
            'roughness',
            'shadow-mapSize',
            'side',
          ],
        },
      ],

      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',

      'tailwindcss/no-custom-classname': [
        'warn',
        {
          whitelist: ['ui\\-.+'],
        },
      ],
    },

    settings: {
      'import/resolver': {
        typescript: {},
      },

      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['src/**/*'],

    plugins: {
      'check-file': checkFile,
    },

    rules: {
      'check-file/filename-naming-convention': [
        'error',
        {
          '**/*.{ts,tsx}': 'KEBAB_CASE',
        },
        {
          ignoreMiddleExtensions: true,
        },
      ],

      'check-file/folder-naming-convention': [
        'error',
        {
          '!(**/__tests__)/**/*': 'KEBAB_CASE',
          '!(src/app)/**/*': 'KEBAB_CASE',
        },
      ],
    },
  },
  {
    files: ['**/*.d.ts'],

    rules: {
      '@typescript-eslint/no-unused-vars': ['off'],
    },
  },
  {
    files: ['**/*rc.*js'],

    rules: {
      'comma-dangle': ['error', 'always-multiline'],
    },
  },
  {
    extends: compat.extends('plugin:playwright/recommended'),

    files: ['e2e/**/*.ts'],

    languageOptions: {
      parser: tsParser,
    },
  },
  ...storybook.configs['flat/recommended'],
  globalIgnores([
    '!**/.eslintrc*',
    '!**/.prettierrc*',
    '**/$path.ts',
    '**/.next',
  ]),
])
