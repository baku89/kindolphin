import {fileURLToPath} from 'node:url'

import vue from '@vitejs/plugin-vue'
import {execSync} from 'child_process'
import fs from 'fs'
import path from 'path'
import {Plugin, UserConfig} from 'vite'
import mkcert from 'vite-plugin-mkcert'
import {VitePWA} from 'vite-plugin-pwa'
import topLevelAwait from 'vite-plugin-top-level-await'

// Serve the local mkcert root CA at /__mkcert/rootCA.pem during dev so
// a phone on the same network can install the trust profile by simply
// opening the URL in mobile Safari. Saves the AirDrop dance on every
// new device. Resolves the CA root via `mkcert -CAROOT` so we don't
// hard-code the platform-specific path. Returns 404 cleanly if mkcert
// isn't on PATH or hasn't been initialised.
function serveMkcertRootCA(): Plugin {
	const caRoot = (() => {
		try {
			return execSync('mkcert -CAROOT').toString().trim()
		} catch {
			return null
		}
	})()

	return {
		name: 'serve-mkcert-root-ca',
		apply: 'serve',
		configureServer(server) {
			server.middlewares.use('/__mkcert/rootCA.pem', (_req, res) => {
				if (!caRoot) {
					res.statusCode = 404
					res.end('mkcert -CAROOT not available')
					return
				}
				const file = path.join(caRoot, 'rootCA.pem')
				if (!fs.existsSync(file)) {
					res.statusCode = 404
					res.end(`rootCA.pem not found at ${file}`)
					return
				}
				res.setHeader('Content-Type', 'application/x-x509-ca-cert')
				res.setHeader(
					'Content-Disposition',
					'attachment; filename="rootCA.pem"'
				)
				fs.createReadStream(file).pipe(res)
			})
		},
	}
}

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
			// Local HTTPS via a locally-trusted CA. AudioWorklet (and other
			// powerful APIs like getUserMedia) require a secure context, and
			// iOS / Android browsers do not treat http://192.168.x.x as
			// secure -- only HTTPS or `localhost`. The plugin shells out to
			// `mkcert` to install a trusted root CA on first run, then
			// issues a leaf cert for the dev server. The result is no
			// "couldn't establish a secure connection" warning on phones,
			// provided the device first imports the CA from
			// /__mkcert/rootCA.pem (served by serveMkcertRootCA below).
			mkcert(),
			serveMkcertRootCA(),
			topLevelAwait({
				// The export name of top-level await promise for each chunk module
				promiseExportName: '__tla',
				// The function to generate import names of top-level await promise in each chunk module
				promiseImportName: i => `__tla_${i}`,
			}),
			vue(),
			VitePWA({
				injectRegister: 'inline',
				devOptions: {
					enabled: true,
				},
				manifest: {
					name: 'Kindolphin',
					short_name: 'Kindolphin',
					theme_color: '#e5e0cf',
					background_color: '#e5e0cf',
					display: 'standalone',
					display_override: ['window-controls-overlay', 'standalone'],
					icons: [
						{
							src: 'pwa-icon.png',
							sizes: '540x540',
							type: 'image/png',
							purpose: 'any maskable',
						},
					],
				},
				workbox: {
					globPatterns: [
						'**/*.{js,css,html,ico,png,svg,webp,gif,mp3,bson.gz}',
						'**/*.{woff2,ttf}',
					],
					maximumFileSizeToCacheInBytes: 10 * 1024 * 1024 /* 10MB */,
					// SPA fallback: avoid white flash and broken edge-to-edge
					// rendering when standalone PWA navigates to an unknown route.
					navigateFallback: 'index.html',
					navigateFallbackDenylist: [
						/^\/robots\.txt$/,
						/^\/manifest\.webmanifest$/,
					],
					cleanupOutdatedCaches: true,
					clientsClaim: true,
					skipWaiting: true,
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
