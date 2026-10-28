import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import boundaries from 'eslint-plugin-boundaries'
import globals from 'globals'

const reactHooksConfig = reactHooks.configs.flat?.recommended ?? reactHooks.configs['recommended-latest']

export default tseslint.config(
  {
    ignores: ['dist', 'node_modules', 'playwright-report', 'playwright-report-visual', 'test-results', 'src/routeTree.gen.ts', 'public', 'lighthouse/reports', 'coverage'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooksConfig,
  {
    files: ['**/*.{ts,tsx,js,mjs}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    plugins: { 'react-refresh': reactRefresh, boundaries },
    settings: {
      'import/resolver': { typescript: { project: './tsconfig.json' } },
      'boundaries/include': ['src/**/*'],
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app' },
        { type: 'routes', pattern: 'src/routes' },
        { type: 'features', pattern: 'src/features/*', capture: ['feature'] },
        { type: 'components', pattern: 'src/components' },
        { type: 'lib', pattern: 'src/lib' },
        { type: 'contracts', pattern: 'src/contracts' },
        { type: 'mocks', pattern: 'src/mocks' },
        { type: 'styles', pattern: 'src/styles' },
        { type: 'assets', pattern: 'src/assets' },
        { type: 'types', pattern: 'src/types' },
      ],
    },
    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports', fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'boundaries/no-unknown-files': 'off',
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            {
              from: { element: { type: 'app' } },
              allow: [
                {
                  to: {
                    element: {
                      type: ['app', 'routes', 'features', 'components', 'lib', 'contracts', 'mocks', 'styles', 'assets', 'types'],
                    },
                  },
                },
              ],
            },
            {
              from: { element: { type: 'routes' } },
              allow: [
                {
                  to: {
                    element: {
                      type: ['routes', 'features', 'components', 'lib', 'contracts', 'assets', 'types'],
                    },
                  },
                },
              ],
            },
            {
              from: { element: { type: 'features' } },
              allow: [
                {
                  to: {
                    element: {
                      type: 'features',
                      captured: { feature: '{{ from.element.captured.feature }}' },
                    },
                  },
                },
                { to: { element: { type: 'features', fileInternalPath: 'index.ts' } } },
                { to: { element: { type: ['components', 'lib', 'contracts', 'assets', 'types'] } } },
              ],
            },
            {
              from: { element: { type: 'components' } },
              allow: [{ to: { element: { type: ['components', 'lib', 'contracts', 'assets', 'types'] } } }],
            },
            {
              from: { element: { type: 'lib' } },
              allow: [{ to: { element: { type: ['lib', 'contracts', 'types'] } } }],
            },
            {
              from: { element: { type: 'contracts' } },
              allow: [{ to: { element: { type: ['contracts', 'types'] } } }],
            },
            {
              from: { element: { type: 'mocks' } },
              allow: [{ to: { element: { type: ['mocks', 'contracts', 'lib', 'types'] } } }],
            },
            {
              from: { element: { type: ['styles', 'assets', 'types'] } },
              allow: [{ to: { element: { type: ['styles', 'assets', 'types'] } } }],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/routes/**/*', 'src/components/ui/**/*'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
)
