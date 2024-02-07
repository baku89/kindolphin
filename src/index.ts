import {createPinia} from 'pinia'
import {createApp} from 'vue'

import PageIndex from '@/components/PageIndex.vue'

const pinia = createPinia()
const app = createApp(PageIndex)
app.use(pinia)

setTimeout(() => {
	app.mount('#app')
}, 10)

const env = (import.meta as any).env

// eslint-disable-next-line no-console
console.info(
	'group_inou / HAPPENING\nVersion: %s\nCommit: %s',
	env.VITE_NPM_VERSION,
	env.VITE_GIT_COMMIT_HASH
)
