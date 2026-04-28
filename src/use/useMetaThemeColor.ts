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
 *    viewport, or falls back to <body> bg if none qualifies. The
 *    sample is captured at initial paint and the live observer
 *    explicitly does NOT track later JS-driven bg-color mutations on
 *    the same element ("intentional, as constant toolbar color
 *    changes would be visually chaotic" — every Safari-26 writeup
 *    says so). What it DOES re-trigger on is changes to the render
 *    tree itself: an element disappearing (display:none / removal)
 *    and a new one appearing.
 *
 *    So instead of mutating bg-color in place, this composable on
 *    every theme change:
 *      a) hides the old anchor (display: none)
 *      b) waits one animation frame so iOS observes the empty
 *         render-tree state and falls back to body bg
 *      c) appends a brand-new anchor with the new bg-color so iOS
 *         re-samples it as a fresh element
 *      d) removes the old (now hidden, off-tree) anchor
 *    The double rAF guards against engines that batch the hide and
 *    the append into a single render pass.
 *
 *    Qualifying criteria (per andesco/safari-color-tinting and
 *    grooovinger.com): position:fixed within 4px of the top edge,
 *    ≥80% viewport width, ≥3px height, solid bg, no mix-blend-mode
 *    or backdrop-filter.
 *
 * 3. <body> background-color via the existing `--theme-bg` CSS
 *    variable — covers the iOS 26 BOTTOM bar (which samples body bg
 *    and DOES re-render on bg-color changes) and acts as a final
 *    fallback for everything else. We additionally set body bg as an
 *    inline style on each theme change: that's a render-tree-visible
 *    property change Safari sometimes picks up on, and it's free.
 *    The CSS-var-driven body { background } rule in style.styl
 *    remains in place as the load-time seed.
 *
 * The very first paint is seeded by the FOUC script in index.html
 * (which creates the meta from cached cssVars). This composable
 * replaces that seed on mount and owns every update afterwards.
 */

// 6px height > 3px observer minimum. top: 0 sits inside the 4px-from-top
// tolerance. Width: 100% via left/right: 0. z-index 1000 so the strip
// always wins the topmost-qualifying-fixed-element race against any
// app-level fixed bg (PageIndex.PageIndex itself is position:fixed with
// bg, so without this the anchor and PageIndex would compete).
const TOP_ANCHOR_STYLE = `
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	height: 6px;
	z-index: 1000;
	pointer-events: none;
`

function applyTopAnchor(bg: string) {
	const previous = Array.from(
		document.querySelectorAll<HTMLDivElement>('.theme-color-anchor-top')
	)

	// Hide every existing anchor up front so iOS sees them leave the
	// render tree before the replacement appears. Don't remove yet —
	// removal during the same task as the append is what gets coalesced
	// into a no-op.
	for (const el of previous) {
		el.style.display = 'none'
	}

	requestAnimationFrame(() => {
		// Now create and append the fresh anchor. iOS sees a new node
		// enter the render tree on the next paint and re-samples its bg.
		const next = document.createElement('div')
		next.className = 'theme-color-anchor-top'
		next.style.cssText = `${TOP_ANCHOR_STYLE}background-color: ${bg};`
		document.body.appendChild(next)

		requestAnimationFrame(() => {
			// Drop the now-hidden previous anchors after one more frame
			// so the new one is unambiguously the topmost candidate
			// before iOS performs its post-paint sample.
			for (const el of previous) {
				el.remove()
			}
		})
	})
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

		// (2) Hide-then-recreate the top anchor across two animation
		// frames so iOS 26 Safari re-samples the URL bar tint. Direct
		// bg mutation on a long-lived element is silently ignored.
		applyTopAnchor(bg)

		// (1) Replace the meta tag so other targets (Android Chrome,
		// iOS standalone PWA, pre-26 iOS Safari) repaint their chrome.
		recreateMetaThemeColor(bg)

		// (3) Mirror the bg onto body's inline style. The CSS var on
		// :root already drives body { background } via the stylesheet,
		// but writing it inline is a separate render-tree mutation
		// that some Safari builds notice for re-sampling.
		document.body.style.backgroundColor = bg
	})
}
