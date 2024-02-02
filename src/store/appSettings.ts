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

	watchEffect(() => {
		const {invert} = currentTheme.value

		for (const [key, value] of Object.entries(currentTheme.value)) {
			if (typeof value === 'boolean') continue

			const varName = '--theme-' + key
			document.body.style.setProperty(varName, value)
		}

		document.body.classList.toggle('invert', invert)
		document.body.style.setProperty('--black', invert ? 'white' : 'black')
		document.body.style.setProperty('--white', invert ? 'black' : 'white')

		// Change the theme-color in the meta tag
		const metaThemeColor = document.querySelector('meta[name=theme-color]')
		if (metaThemeColor) {
			metaThemeColor.setAttribute('content', currentTheme.value.bg)
		}
	})

	return {muted, themes, themeIndex, currentTheme, lang}
})
