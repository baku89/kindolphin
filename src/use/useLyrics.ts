import {Lyrics} from '@/lyrics'
import {binarySearchBound} from '@/utils'

export function useLyrics() {
	function getLyricsBetween(inTime: number, outTime: number) {
		return binarySearchBound(
			Lyrics,
			inTime,
			outTime,
			(lyric, time) => lyric.time - time
		)
	}

	return {
		getLyricsBetween,
	}
}
