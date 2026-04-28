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
			primary: '#ff3838',
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
			primary: '#16dc90',
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

	const themeIndex = useLocalStorage('jp.g-a-l.happening.themeIndex', 1)

	const currentTheme = computed(() => themes.value[themeIndex.value])

	const lastPlayedTime = useLocalStorage('jp.g-a-l.happening.lastPlayedTime', 0)

	const readPositions = useLocalStorage<Record<string, number | undefined>>(
		'jp.g-a-l.happening.readPositions',
		{}
	)

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

		// Re-insert <meta name="theme-color"> from scratch on every theme
		// change. iOS Safari freezes the URL-bar tint observer when the
		// existing meta's content is mutated in place, but replacing the
		// node forces a re-evaluation. Remove every prior meta with this
		// name (defensive against duplicates from the FOUC script) and
		// append a fresh one with the active bg.
		document
			.querySelectorAll('meta[name=theme-color]')
			.forEach(el => el.remove())
		const metaThemeColor = document.createElement('meta')
		metaThemeColor.setAttribute('name', 'theme-color')
		metaThemeColor.setAttribute('content', currentTheme.value.bg)
		document.head.appendChild(metaThemeColor)

		localStorage.setItem('jp.g-a-l.happening.cssVars', JSON.stringify(lsCache))
		localStorage.setItem('jp.g-a-l.happening.invert', JSON.stringify(invert))
	})

	// Mirror the active language to <html lang>. CSS rules in style.styl key
	// off the root's lang to hide elements whose own `lang` attribute
	// doesn't match -- that's how the bilingual <p lang="ja"> / <p lang="en">
	// content in PaneHelp etc. gets filtered to a single language.
	watchEffect(() => {
		document.documentElement.lang = lang.value
	})

	return {
		muted,
		themes,
		themeIndex,
		currentTheme,
		lang,
		lastPlayedTime,
		readPositions,
	}
})
