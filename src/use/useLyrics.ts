import {Ref} from 'vue'

import {Lyric} from '@/book'

export function useLyrics(lyrics: Ref<Lyric[]>) {
	function getLyricsBetween(inTime: number, outTime: number) {
		return lyrics.value.filter(
			lyric => inTime < lyric.time && lyric.time <= outTime
		)
	}
	return {
		getLyricsBetween,
	}
}
