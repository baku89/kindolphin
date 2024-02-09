import {fileURLToPath} from 'node:url'

import vue from '@vitejs/plugin-vue'
import {execSync} from 'child_process'
import {UserConfig} from 'vite'
import {VitePWA} from 'vite-plugin-pwa'
import topLevelAwait from 'vite-plugin-top-level-await'

export default (): UserConfig => {
	const commitHash = execSync('git rev-parse --short HEAD')
		.toString()
		.trim()
		.substr(0, 7)

	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const pjson = require('./package.json')

	process.env.VITE_GIT_COMMIT_HASH = commitHash
	process.env.VITE_NPM_VERSION = pjson.version

	return {
		base: './',
		server: {
			port: 5552,
		},
		plugins: [
			topLevelAwait({
				// The export name of top-level await promise for each chunk module
				promiseExportName: '__tla',
				// The function to generate import names of top-level await promise in each chunk module
				promiseImportName: i => `__tla_${i}`,
			}),
			vue(),
			VitePWA({
				registerType: 'autoUpdate',
				manifest: {
					name: 'HAPPENING',
					short_name: 'HAPPENING',
					theme_color: '#e5e0cf',
					display: 'standalone',
					display_override: ['window-controls-overlay', 'standalone'],
					icons: [
						{
							src: 'pwa-icon.png',
							sizes: '512x512',
							type: 'image/png',
							purpose: 'any maskable',
						},
					],
				},
				workbox: {
					globPatterns: [
						'**/*.{js,css,html,ico,png,svg,webp,gif,mp3,.bson.gz}',
					],
					maximumFileSizeToCacheInBytes: 10 * 1024 * 1024 /* 10MB */,
				},
			}),
		],
		resolve: {
			alias: [
				{
					find: '@',
					replacement: fileURLToPath(new URL('./src', import.meta.url)),
				},
			],
		},
	}
}
