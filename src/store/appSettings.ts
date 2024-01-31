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
			primary: '#ff0000',
		},
	])

	const themeIndex = useLocalStorage('jp.g-a-l.happening.themeIndex', 0)

	const currentTheme = computed(() => themes.value[themeIndex.value])

	watchEffect(() => {
		for (const [key, value] of Object.entries(currentTheme.value)) {
			const varName = '--color-' + key
			document.body.style.setProperty(varName, value)
		}
	})

	return {muted, themes}
})
