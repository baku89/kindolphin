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

	const lang = useLocalStorage(
		'jp.g-a-l.happening.lang',
		navigator.language === 'ja' ? 'ja' : 'en'
	)

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
			bg: '#234286',
			ink: '#fcc6e1',
			primary: '#ff0000',
			invert: true,
		},
		{
			bg: '#000000',
			ink: '#dee0e1',
			primary: '#cde670',
			invert: true,
		},
	])

	const themeIndex = useLocalStorage('jp.g-a-l.happening.themeIndex', 0)

	const currentTheme = computed(() => themes.value[themeIndex.value])

	const lastPlayedTime = useLocalStorage('jp.g-a-l.happening.lastPlayedTime', 0)

	watchEffect(() => {
		const {invert} = currentTheme.value

		const lsCache: Record<string, string> = {}

		const html = document.documentElement

		for (const [key, value] of Object.entries(currentTheme.value)) {
			if (typeof value === 'boolean') continue

			const varName = '--theme-' + key
			html.style.setProperty(varName, value)
			lsCache[varName] = value
		}

		html.classList.toggle('invert', invert)
		html.style.setProperty('--black', invert ? 'white' : 'black')
		html.style.setProperty('--white', invert ? 'black' : 'white')

		localStorage.setItem('jp.g-a-l.happening.cssVars', JSON.stringify(lsCache))
		localStorage.setItem('jp.g-a-l.happening.invert', JSON.stringify(invert))

		// Change the theme-color in the meta tag
		const metaThemeColor = document.querySelector('meta[name=theme-color]')
		if (metaThemeColor) {
			metaThemeColor.setAttribute('content', currentTheme.value.bg)
		}
	})

	return {muted, themes, themeIndex, currentTheme, lang, lastPlayedTime}
})
