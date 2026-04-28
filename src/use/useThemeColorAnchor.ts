import {onMounted} from 'vue'

/**
 * Inject a pair of anchor elements that drive Safari's URL-bar / tab-bar
 * tint colors directly via WebKit's "live observer" sampling path.
 *
 * Background:
 *   iOS Safari 16+ ignores `<meta name="theme-color">` for tint purposes.
 *   What it actually uses is a built-in observer on the background-color of
 *   `position: fixed` elements that meet specific criteria:
 *     - within 4px of the top (or bottom) edge
 *     - >= 80% viewport width on iOS
 *     - >= 3px height
 *     - solid background-color (not mix-blend-mode / backdrop-filter)
 *     - sufficiently high z-index
 *   When such an element's background-color updates, WebKit re-tints the
 *   chrome live -- without scroll, history, or any JS nudging.
 *
 *   See https://github.com/andesco/safari-color-tinting for a working demo
 *   that establishes these criteria empirically.
 *
 * Why a composable / runtime injection instead of static markup:
 *   The two anchor elements and their styles are purely a Safari-tinting
 *   concern. Keeping them in their own composable -- with its own scoped
 *   <style> tag -- means index.html and the page templates stay clean, and
 *   removing the workaround later is a single-file delete.
 *
 * Why a single anchor isn't enough:
 *   WebKit observes the top and bottom independently. A top-only anchor
 *   tints the URL bar but the bottom toolbar continues to fall back to
 *   sampling whatever is at the bottom of the page, which may include
 *   `mix-blend-mode` overlays and produce surprising colors. Two anchors
 *   close the loop symmetrically.
 *
 *   The anchors are visually invisible because their background matches the
 *   theme bg -- the same color the rest of the page paints in the safe-area
 *   regions after our overlay composite.
 */
// 3px is the documented minimum height WebKit's tint observer accepts
// (per the andesco/safari-color-tinting demo). We sit on that floor so
// the strip is as close to invisible as possible and doesn't clip
// content that wants to render edge-to-edge (e.g. the splash ramp at
// top: 0). Deliberately a fixed height rather than `max(3px, safe-area)`:
// the strip only needs to hold WebKit's attention, not to fill the
// safe-area region.
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

export function useThemeColorAnchor() {
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
