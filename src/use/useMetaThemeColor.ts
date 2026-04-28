import {watchEffect} from 'vue'

import {useAppSettingsStore} from '@/store/appSettings'

/**
 * Single source of truth for tinting iOS Safari, iOS standalone PWA,
 * Android Chrome, and Apple's "Liquid Glass" chrome (iOS / iPadOS / macOS
 * 26+) with the active theme bg.
 *
 * Three orthogonal mechanisms run together because no single one
 * covers every platform / OS version:
 *
 * 1. <meta name="theme-color"> — the cross-platform signal.
 *    Android Chrome reads it for the address bar, iOS standalone PWA
 *    reads it for the notch / status bar, and pre-26 iOS Safari reads
 *    it for the URL bar. Safari 26 itself ignores the meta entirely
 *    (it derives the toolbar color from CSS instead) but other
 *    targets still need it, so we keep it. Replacing the node (rather
 *    than mutating its content attribute) is what actually triggers a
 *    repaint on those targets that DO read it.
 *
 * 2. Top fixed-position "anchor" element — required for iOS 26 Safari.
 *    Safari 26 samples the URL/tab bar's tint from the background-color
 *    of a qualifying position:fixed element near the top edge of the
 *    viewport (or falls back to <body> bg if none qualifies). The
 *    sample is taken at initial paint AND when the element is added
 *    / removed, but DOES NOT re-trigger when an existing element's
 *    background-color changes — even via CSS variable. So mutating
 *    `var(--theme-bg)` is a dead end for the top bar in iOS 26; we
 *    have to remove and re-create the anchor element on every theme
 *    change to force re-sampling. The qualifying criteria (per the
 *    andesco/safari-color-tinting demo and grooovinger.com): position
 *    fixed within 4px of the top edge, ≥80% viewport width, ≥3px
 *    height, solid bg, no mix-blend-mode/backdrop-filter.
 *
 * 3. <body> background-color via the existing `--theme-bg` CSS
 *    variable — covers the iOS 26 BOTTOM bar (which samples body bg
 *    and DOES re-render on bg-color changes) and acts as a final
 *    fallback for everything else. This is owned by appSettings + the
 *    body { background var(--theme-bg) } rule in style.styl, so this
 *    composable doesn't manage it directly; we just rely on it.
 *
 * The very first paint is seeded by the FOUC script in index.html
 * (which creates the meta from cached cssVars). This composable
 * replaces that seed on mount and owns every update afterwards.
 */

// 6px > 3px observer minimum, with bottom: -8px / top: 0 placement
// well within the 4px / 3px edge tolerances. Higher z-index than
// app content but below modal overlays so we don't accidentally win
// the sample fight when a modal that does want to tint the bar opens.
const TOP_ANCHOR_STYLE = `
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	height: 6px;
	z-index: 1;
	pointer-events: none;
`

function recreateTopAnchor(bg: string) {
	document
		.querySelectorAll('.theme-color-anchor-top')
		.forEach(el => el.remove())

	const el = document.createElement('div')
	el.className = 'theme-color-anchor-top'
	el.style.cssText = `${TOP_ANCHOR_STYLE}background-color: ${bg};`
	document.body.appendChild(el)
}

function recreateMetaThemeColor(bg: string) {
	document
		.querySelectorAll('meta[name=theme-color]')
		.forEach(el => el.remove())

	const meta = document.createElement('meta')
	meta.setAttribute('name', 'theme-color')
	meta.setAttribute('content', bg)
	document.head.appendChild(meta)
}

export function useMetaThemeColor() {
	const settings = useAppSettingsStore()

	// One reactive pass per theme change. watchEffect runs synchronously
	// during setup so the first invocation happens before mount, which
	// is fine — both the meta and the anchor element are appended to
	// nodes (head / body) that exist by the time setup runs.
	watchEffect(() => {
		const bg = settings.currentTheme.bg

		// (2) Recreate the top fixed anchor so iOS 26 Safari re-samples
		// the URL/tab bar tint. Mutating bg-color in place is silently
		// ignored by the live observer in iOS 26.
		recreateTopAnchor(bg)

		// (1) Replace the meta tag so other targets (Android Chrome,
		// iOS standalone PWA, pre-26 iOS Safari) repaint their chrome.
		recreateMetaThemeColor(bg)

		// (3) The bottom toolbar is driven by body's bg-color, which
		// appSettings already updates via the `--theme-bg` CSS variable
		// — no work needed here.
	})
}
