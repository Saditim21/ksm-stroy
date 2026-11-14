import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'build', '.react-router']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      // React Router route modules export these next to the page component.
      // Its Vite plugin hot-reloads them, so they do not break Fast Refresh.
      'react-refresh/only-export-components': ['error', {
        allowConstantExport: true,
        allowExportNames: ['meta', 'links', 'headers', 'loader', 'clientLoader', 'action', 'clientAction', 'handle', 'shouldRevalidate', 'HydrateFallback', 'ErrorBoundary', 'Layout'],
      }],
    },
  },
  {
    // The build config files run in Node.
    files: ['*.config.js'],
    languageOptions: { globals: globals.node },
  },
  {
    // The build and data scripts (scripts/*.mjs) run in Node.
    files: ['**/*.mjs'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
  },
  {
    // Vitest runs test files with its globals injected (globalThis, not an
    // import) — the `globals` package has no "vitest" set, so declare the
    // handful this repo actually uses by hand. (redesign v1 @5cecebb)
    files: ['**/*.test.{js,jsx}', 'src/test/**'],
    languageOptions: {
      globals: {
        test: 'readonly',
        expect: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        vi: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        suite: 'readonly',
        assert: 'readonly',
      },
    },
  },
])
