import {createApp} from 'vue'

import PageIndex from '@/components/PageIndex.vue'

const app = createApp(PageIndex)

app.mount('#app')

window.addEventListener('touchmove', e => {
	e.preventDefault()
})
