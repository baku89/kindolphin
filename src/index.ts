import {createPinia} from 'pinia'
import {createApp} from 'vue'

import PageIndex from '@/components/PageIndex.vue'

const pinia = createPinia()
const app = createApp(PageIndex)
app.use(pinia)

setTimeout(() => {
	app.mount('#app')
}, 1000)

window.addEventListener('touchmove', e => {
	e.preventDefault()
})
