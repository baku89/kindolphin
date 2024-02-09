import {vec2} from 'linearly'

export interface Page {
	src: string
	width: number
	height: number
}

export interface Lyric {
	index: number
	time: number
	duration: number
	offset: vec2
	size: vec2
	bitmap: Uint8Array
}

export interface Book {
	pages: Page[]
	lyricSrc: string
}
