import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import unusedImports from 'eslint-plugin-unused-imports'
import vue from 'eslint-plugin-vue'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import vueParser from 'vue-eslint-parser'

export default tseslint.config(
	{ignores: ['dist', 'dev-dist', 'node_modules']},
	js.configs.recommended,
	...tseslint.configs.recommended,
	...vue.configs['flat/essential'],
	{
		files: ['**/*.{ts,vue}'],
		languageOptions: {
			parser: vueParser,
			parserOptions: {
				parser: tseslint.parser,
				ecmaVersion: 2022,
				sourceType: 'module',
			},
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
		plugins: {
			'simple-import-sort': simpleImportSort,
			'unused-imports': unusedImports,
		},
		rules: {
			'arrow-body-style': 'off',
			'no-console': 'warn',
			'no-debugger': 'warn',
			'no-undef': 'off',
			eqeqeq: 'error',
			'prefer-const': 'error',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'simple-import-sort/imports': 'error',
			'unused-imports/no-unused-imports': 'error',
			'vue/no-multiple-template-root': 'off',
			'vue/multi-word-component-names': 'off',
			'vue/no-v-model-argument': 'off',
			'vue/attribute-hyphenation': 'off',
			'vue/require-default-prop': 'off',
		},
	},
	prettier
)
