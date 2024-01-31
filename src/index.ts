import {createPinia} from 'pinia'
import {createApp} from 'vue'

import PageIndex from '@/components/PageIndex.vue'

const pinia = createPinia()
const app = createApp(PageIndex)
app.use(pinia)

app.mount('#app')

window.addEventListener('touchmove', e => {
	e.preventDefault()
})
