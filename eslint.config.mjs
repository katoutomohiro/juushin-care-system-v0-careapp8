import tseslint from 'typescript-eslint';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
	{ ignores: ['.next/**', 'out/**', 'build/**', 'next-env.d.ts'] },

	// Minimal TS lint: parser + basic unused vars as warning
	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			parser: tseslint.parser,
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: { ...globals.browser, ...globals.node },
		},
			plugins: {
				'@typescript-eslint': tseslint.plugin,
				'react-hooks': reactHooks,
			},
		rules: {
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',
		},
	},

	// Minimal JS lint: unused vars as warning
	{
		files: ['**/*.{js,jsx}'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: { ...globals.browser, ...globals.node },
		},
		rules: { 'no-unused-vars': 'warn' },
	},

	// Service Worker globals
	{
		files: ['public/sw.js'],
		languageOptions: { globals: { ...globals.serviceworker } },
	},
];
