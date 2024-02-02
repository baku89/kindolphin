import {mapValues} from 'lodash'
import {defineStore} from 'pinia'
import {computed} from 'vue'

import {useAppSettingsStore} from './appSettings'

export const useUIStore = defineStore('ui', () => {
	const appSettings = useAppSettingsStore()

	const Label = {
		theme: {
			en: 'Theme',
			ja: 'テーマ',
		},
		lang: {
			en: '日本語',
			ja: 'English',
		},
		viewOnYouTube: {
			en: 'View on YouTube',
			ja: 'YouTubeで見る',
		},
		help: {
			en: 'Help',
			ja: 'ヘルプ',
		},
		listen: {
			en: 'Listen',
			ja: '聴く',
		},
		readNow: {
			en: 'READ NOW',
			ja: '今すぐ読む',
		},
	}

	const label = computed(() => {
		const lang = appSettings.lang as 'en' | 'ja'

		return mapValues(Label, value => {
			return value[lang] as string
		})
	})

	return {label}
})
