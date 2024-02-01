import {useLocalStorage} from '@vueuse/core'
import {defineStore} from 'pinia'
import {computed, ref, watchEffect} from 'vue'

interface Theme {
	bg: string
	ink: string
	primary: string
	invert: boolean
}

export const useAppSettingsStore = defineStore('appSettings', () => {
	const muted = useLocalStorage('jp.g-a-l.happening.muted', false)

	const themes = ref<Theme[]>([
		{
			bg: '#ffffff',
			ink: '#000000',
			primary: '#ff6338',
			invert: false,
		},
		{
			bg: '#e5e0cf',
			ink: '#4b3876',
			primary: '#ff6338',
			invert: false,
		},
		{
			bg: '#c0eac1',
			ink: '#3d4519',
			primary: '#17db90',
			invert: false,
		},
		{
			bg: '#ffffff',
			ink: '#1f1f1f',
			primary: '#ff6338',
			invert: true,
		},
	])

	const themeIndex = useLocalStorage('jp.g-a-l.happening.themeIndex', 0)

	const currentTheme = computed(() => themes.value[themeIndex.value])

	watchEffect(() => {
		for (const [key, value] of Object.entries(currentTheme.value)) {
			const varName = '--color-' + key
			document.body.style.setProperty(
				varName,
				typeof value === 'boolean' ? (value ? '1' : '0') : value
			)
		}

		// Change the theme-color in the meta tag
		const metaThemeColor = document.querySelector('meta[name=theme-color]')
		if (metaThemeColor) {
			metaThemeColor.setAttribute('content', currentTheme.value.bg)
		}
	})

	const show = ref(false)

	return {muted, themes, show, themeIndex, currentTheme}
})
