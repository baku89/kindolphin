import {fileURLToPath} from 'node:url'

import vue from '@vitejs/plugin-vue'
import {defineConfig} from 'vite'

export default defineConfig({
	base: './',
	plugins: [vue()],
	resolve: {
		alias: [
			{
				find: '@',
				replacement: fileURLToPath(new URL('./src', import.meta.url)),
			},
		],
	},
})
