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
		share: {
			en: 'Share',
			ja: 'シェア',
		},
		listen: {
			en: 'Listen',
			ja: '聴く',
		},
		install: {
			en: 'Install',
			ja: 'インストール',
		},
		readNow: {
			en: 'READ NOW',
			ja: '今すぐ読む',
		},
		loading: {
			en: 'DOWNLOADING...',
			ja: '読み込み中...',
		},
		soundAlert: {
			en: 'Sound will play',
			ja: '音が出ます',
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
