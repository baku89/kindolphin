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

app.mount('#app')

const env = (import.meta as any).env

// eslint-disable-next-line no-console
console.info(
	'group_inou / HAPPENING\nVersion: %s\nCommit: %s',
	env.VITE_NPM_VERSION,
	env.VITE_GIT_COMMIT_HASH
)
