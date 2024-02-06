import {vec2} from 'linearly'

export interface Page {
	src: string
	width: number
	height: number
}

export interface Lyric {
	time: number
	duration: number
	offset: vec2
	size: vec2
}

export interface Book {
	pages: Page[]
	lyrics: Lyric[]
}
