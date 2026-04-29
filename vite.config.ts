import {fileURLToPath} from 'node:url'

import vue from '@vitejs/plugin-vue'
import {execSync} from 'child_process'
import {randomUUID} from 'crypto'
import fs from 'fs'
import path from 'path'
import {Plugin, UserConfig} from 'vite'
import mkcert from 'vite-plugin-mkcert'
import {VitePWA} from 'vite-plugin-pwa'

// Serve the local mkcert root CA during dev so a phone on the same
// network can install the trust profile by simply opening a URL in
// mobile Safari -- skipping the AirDrop step every new device.
//
// Two endpoints because the platforms expect different shapes:
//   /__mkcert/mkcert.mobileconfig — iOS / iPadOS Configuration Profile.
//     Mobile Safari only recognises a CA install if it arrives as a
//     plist-wrapped .mobileconfig with mime type
//     application/x-apple-aspen-config; raw PEM is rejected as
//     "invalid".
//   /__mkcert/rootCA.pem — the raw PEM, for desktop browsers and
//     Android (where the .mobileconfig wrapper is meaningless).
//
// Both resolve the CA path via `mkcert -CAROOT` rather than
// hard-coding the platform-specific location, and 404 cleanly if
// mkcert isn't installed.
function serveMkcertRootCA(): Plugin {
	const caRoot = (() => {
		try {
			return execSync('mkcert -CAROOT').toString().trim()
		} catch {
			return null
		}
	})()

	function readRootCA() {
		if (!caRoot) return null
		const file = path.join(caRoot, 'rootCA.pem')
		if (!fs.existsSync(file)) return null
		return fs.readFileSync(file, 'utf8')
	}

	function buildMobileConfig(pem: string): string {
		// The cert payload in a mobileconfig is base64-encoded DER. The
		// body of a PEM file (between BEGIN/END markers) is already that
		// base64-of-DER, so we just strip the markers and whitespace.
		const certBase64 = pem
			.replace(/-----BEGIN CERTIFICATE-----/g, '')
			.replace(/-----END CERTIFICATE-----/g, '')
			.replace(/\s+/g, '')
		const profileUUID = randomUUID().toUpperCase()
		const certUUID = randomUUID().toUpperCase()
		return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>PayloadContent</key>
	<array>
		<dict>
			<key>PayloadCertificateFileName</key>
			<string>rootCA.pem</string>
			<key>PayloadContent</key>
			<data>${certBase64}</data>
			<key>PayloadDescription</key>
			<string>mkcert local development CA</string>
			<key>PayloadDisplayName</key>
			<string>mkcert dev CA</string>
			<key>PayloadIdentifier</key>
			<string>dev.kindolphin.mkcert.cert.${certUUID}</string>
			<key>PayloadType</key>
			<string>com.apple.security.root</string>
			<key>PayloadUUID</key>
			<string>${certUUID}</string>
			<key>PayloadVersion</key>
			<integer>1</integer>
		</dict>
	</array>
	<key>PayloadDescription</key>
	<string>Installs the mkcert local CA so this device trusts HTTPS dev servers signed by it.</string>
	<key>PayloadDisplayName</key>
	<string>mkcert dev CA (kindolphin)</string>
	<key>PayloadIdentifier</key>
	<string>dev.kindolphin.mkcert.${profileUUID}</string>
	<key>PayloadOrganization</key>
	<string>kindolphin dev</string>
	<key>PayloadRemovalDisallowed</key>
	<false/>
	<key>PayloadType</key>
	<string>Configuration</string>
	<key>PayloadUUID</key>
	<string>${profileUUID}</string>
	<key>PayloadVersion</key>
	<integer>1</integer>
</dict>
</plist>
`
	}

	return {
		name: 'serve-mkcert-root-ca',
		apply: 'serve',
		configureServer(server) {
			server.middlewares.use(
				'/__mkcert/mkcert.mobileconfig',
				(_req, res) => {
					const pem = readRootCA()
					if (!pem) {
						res.statusCode = 404
						res.end('mkcert rootCA not found')
						return
					}
					res.setHeader('Content-Type', 'application/x-apple-aspen-config')
					res.setHeader(
						'Content-Disposition',
						'attachment; filename="mkcert.mobileconfig"'
					)
					res.end(buildMobileConfig(pem))
				}
			)
			server.middlewares.use('/__mkcert/rootCA.pem', (_req, res) => {
				const pem = readRootCA()
				if (!pem) {
					res.statusCode = 404
					res.end('mkcert rootCA not found')
					return
				}
				res.setHeader('Content-Type', 'application/x-pem-file')
				res.setHeader(
					'Content-Disposition',
					'attachment; filename="rootCA.pem"'
				)
				res.end(pem)
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
			// provided the device first imports the CA via
			// /__mkcert/mkcert.mobileconfig (iOS) or /__mkcert/rootCA.pem
			// (desktop / Android), both served by serveMkcertRootCA below.
			mkcert(),
			serveMkcertRootCA(),
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
