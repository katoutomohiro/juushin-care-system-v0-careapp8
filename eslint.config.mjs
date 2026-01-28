import tseslint from 'typescript-eslint';
import globals from 'globals';

export default [
	{ ignores: ['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'docs/**', 'supabase/migrations/**', '**/*.md', '**/*.sql'] },

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
			},
		rules: {
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
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
