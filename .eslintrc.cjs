module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: ['eslint:recommended', 'next/core-web-vitals', 'plugin:perfectionist/recommended-alphabetical-legacy'],
  ignorePatterns: [
    'node_modules/*',
    'public/mockServiceWorker.js',
    'generators/*',
  ],
  overrides: [
    {
      env: {
        browser: true,
        es6: true,
        node: true,
      },
      extends: [
        'eslint:recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:jsx-a11y/recommended',
        'plugin:prettier/recommended',
        'plugin:testing-library/react',
        'plugin:jest-dom/recommended',
        'plugin:tailwindcss/recommended',
        'plugin:vitest/legacy-recommended',
      ],
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
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
              // disables cross-feature imports:
              // eg. src/features/discussions should not import from src/features/comments, etc.
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
              // enforce unidirectional codebase:

              // e.g. src/app can import from src/features but not the other way around
              {
                from: './src/app',
                target: './src/features',
              },

              // e.g src/features and src/app can import from these shared modules but not the other way around
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
            alphabetize: { caseInsensitive: true, order: 'asc' },
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
        "perfectionist/sort-imports": "off",
        'prettier/prettier': ['error', {}, { usePrettierrc: true }],
        'react/prop-types': 'off',
        'react/react-in-jsx-scope': 'off',
        'tailwindcss/no-custom-classname': ["warn", {
          'whitelist': [
            // `ui-` をプレフィクスとしてカスタムクラスを許容
            'ui\\-.+',
          ],
        }],
      },
      settings: {
        'import/resolver': {
          typescript: {},
        },
        react: { version: 'detect' },
      },
    },
    {
      files: ['src/**/*'],
      plugins: ['check-file'],
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
        'comma-dangle': ["error", "always-multiline"],
      },
    },
  ],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  root: true,
};
