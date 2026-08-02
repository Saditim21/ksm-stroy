import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
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
      // `^[A-Z_]` covers imported components and SCREAMING_CASE constants:
      // core no-unused-vars has no idea JSX counts as a use (that lives in
      // eslint-plugin-react's jsx-uses-vars, which this config does not load),
      // so every `import Navbar from ...` would otherwise read as unused.
      //
      // `motion` is the one JSX identifier that is lowercase — it is always
      // used as `<motion.div>`, a member expression the rule likewise cannot
      // see — so it needs naming explicitly. Without it every framer-motion
      // consumer in the repo reported a false "'motion' is defined but never
      // used" (20 of them), which is exactly the kind of noise that trains
      // people to stop reading lint output.
      'no-unused-vars': ['error', { varsIgnorePattern: '^([A-Z_]|motion$)' }],
    },
  },
  {
    // Vitest runs test files with its globals injected (globalThis, not an
    // import) — the `globals` package has no "vitest" set, so declare the
    // handful this repo actually uses by hand.
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
