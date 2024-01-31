import {useLocalStorage} from '@vueuse/core'
import {defineStore} from 'pinia'
import {computed, ref, watchEffect} from 'vue'

interface Theme {
	bg: string
	ink: string
	primary: string
}

export const useAppSettingsStore = defineStore('appSettings', () => {
	const muted = useLocalStorage('jp.g-a-l.happening.muted', false)

	const themes = ref<Theme[]>([
		{
			bg: '#e5e0cf',
			ink: '#4b3876',
			primary: '#ff6338',
		},
		{
			bg: 'white',
			ink: 'black',
			primary: '#ff6338',
		},
	])

	const themeIndex = useLocalStorage('jp.g-a-l.happening.themeIndex', 0)

	const currentTheme = computed(() => themes.value[themeIndex.value])

	watchEffect(() => {
		for (const [key, value] of Object.entries(currentTheme.value)) {
			const varName = '--color-' + key
			document.body.style.setProperty(varName, value)
		}

		// Change the theme-color in the meta tag
		const metaThemeColor = document.querySelector('meta[name=theme-color]')
		if (metaThemeColor) {
			metaThemeColor.setAttribute('content', currentTheme.value.bg)
		}
	})

	const show = ref(false)

	return {muted, themes, show, themeIndex}
})
