import {Lyrics} from '@/lyrics'

type ArrayElement<ArrayType extends readonly unknown[]> =
	ArrayType extends readonly (infer ElementType)[] ? ElementType : never

export type Lyric = ArrayElement<typeof Lyrics>

export function useLyrics() {
	function getLyricsBetween(inTime: number, outTime: number) {
		return Lyrics.filter(lyric => inTime < lyric.time && lyric.time <= outTime)
	}
	return {
		lyrics: Lyrics,
		getLyricsBetween,
	}
}
