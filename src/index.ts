import {createPinia} from 'pinia'
import {createApp} from 'vue'

import PageIndex from '@/components/PageIndex.vue'

const pinia = createPinia()
const app = createApp(PageIndex)
app.use(pinia)

app.directive('hover', {
	mounted(el) {
		function onHover() {
			el.classList.add('hover')
		}
		function offHover() {
			el.classList.remove('hover')
		}

		el.addEventListener('mouseenter', onHover)
		el.addEventListener('mouseleave', offHover)
		el.addEventListener('touchstart', onHover)
		el.addEventListener('touchend', offHover)
		el.addEventListener('touchcancel', offHover)
		window.addEventListener('touchcancel', offHover)
	},
})

app.directive('inert', {
	mounted(el) {
		el.addEventListener('focus', () => {
			el.blur?.()
		})
	},
})

app.mount('#app')

const env = (import.meta as any).env

// eslint-disable-next-line no-console
console.info(
	'group_inou / HAPPENING\nVersion: %s\nCommit: %s',
	env.VITE_NPM_VERSION,
	env.VITE_GIT_COMMIT_HASH
)

// PWA
// https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Trigger_install_prompt
window.addEventListener('beforeinstallprompt', e => {
	e.preventDefault()
	// eslint-disable-next-line no-console
	console.info('PWA support detected')
	;(window as any).deferredPrompt = e
})

// When the service worker is configured with skipWaiting + clientsClaim
// (see vite.config.ts), a freshly deployed build activates the new SW
// in the background and takes control of the live page without
// reloading. The HTML/JS already in memory is still the old version
// though, so the user keeps seeing stale UI until they manually
// refresh. Force a one-shot reload as soon as a NEW controller takes
// over so the page is guaranteed to match the cache the SW just
// installed.
//
// `controllerchange` also fires on the very first install (no prior
// controller -> first controller). We skip that case by checking the
// initial controller: a reload there would loop on first visit.
if ('serviceWorker' in navigator) {
	const hadController = !!navigator.serviceWorker.controller
	let reloading = false
	navigator.serviceWorker.addEventListener('controllerchange', () => {
		if (!hadController || reloading) return
		reloading = true
		window.location.reload()
	})
}
