import {onMounted, watchEffect} from 'vue'

import {useAppSettingsStore} from '@/store/appSettings'

/**
 * Single source of truth for tinting iOS / Safari / Android chrome with the
 * active theme bg.
 *
 * Primary mechanism: <meta name="theme-color">.
 *   The standard, cross-platform signal. iOS Safari and Chrome both read
 *   it and tint the URL bar / status bar / installed-PWA notch with the
 *   color it carries. We re-CREATE the element on every theme change
 *   (not just mutate its content): mutating in place leaves iOS Safari's
 *   URL-bar tint frozen on the previous color, but a fresh node forces
 *   a re-evaluation. The very first paint is seeded by an inline FOUC
 *   script in index.html; this composable replaces that seed and owns
 *   every update from then on.
 *
 * Secondary workaround: a pair of fixed-element anchor strips.
 *   iOS 16+ Safari (and likely iOS 26 too, where this surfaced again)
 *   has a parallel "live observer" tint path that samples the
 *   background-color of qualifying position:fixed elements at the top
 *   and bottom edges. The meta path covers most cases, but Safari can
 *   ignore or stale the meta in edge cases (e.g. tab restore, some
 *   reload flows); these strips backstop those by carrying the same
 *   color via CSS variable. They cost nothing visually because their
 *   bg matches the theme bg.
 *
 * The criteria the live observer enforces (per the
 * andesco/safari-color-tinting demo):
 *   - position: fixed within 4px of the top (or bottom) edge
 *   - >= 80% viewport width on iOS
 *   - >= 3px height
 *   - solid background-color (not mix-blend-mode / backdrop-filter)
 *   - sufficiently high z-index
 */

// 3px is the documented minimum height the iOS tint observer accepts
// (per the andesco/safari-color-tinting demo). We sit on that floor so
// the strip is as close to invisible as possible and doesn't clip
// content that wants to render edge-to-edge (e.g. the splash ramp at
// top: 0). Deliberately a fixed height rather than `max(3px, safe-area)`:
// the strip only needs to hold the observer's attention, not to fill
// the safe-area region.
const ANCHOR_STYLES = `
.theme-color-anchor {
	position: fixed;
	left: 0;
	right: 0;
	height: 3px;
	background-color: var(--theme-bg);
	z-index: 1000;
	pointer-events: none;
}
.theme-color-anchor-top { top: 0; }
.theme-color-anchor-bottom { bottom: 0; }
`

export function useMetaThemeColor() {
	const settings = useAppSettingsStore()

	// Primary: replace <meta name="theme-color"> from scratch on every
	// theme change. Mutating the existing node's content attribute
	// leaves iOS Safari's URL-bar tint frozen on the previous color,
	// but appending a fresh element forces a re-evaluation. We remove
	// every prior meta with this name (defensive against duplicates
	// from the FOUC script in index.html) and append a new one.
	watchEffect(() => {
		const bg = settings.currentTheme.bg
		document
			.querySelectorAll('meta[name=theme-color]')
			.forEach(el => el.remove())
		const meta = document.createElement('meta')
		meta.setAttribute('name', 'theme-color')
		meta.setAttribute('content', bg)
		document.head.appendChild(meta)
	})

	// Secondary (iOS 26 workaround): inject the live-observer anchor
	// strips. Their bg is keyed off `var(--theme-bg)`, which
	// appSettings updates as part of the same theme switch, so the
	// observer repaints the chrome live without needing JS to touch
	// the strips here.
	onMounted(() => {
		if (document.querySelector('.theme-color-anchor')) return

		const style = document.createElement('style')
		style.textContent = ANCHOR_STYLES
		document.head.appendChild(style)

		for (const pos of ['top', 'bottom'] as const) {
			const el = document.createElement('div')
			el.className = `theme-color-anchor theme-color-anchor-${pos}`
			document.body.appendChild(el)
		}
	})
}
