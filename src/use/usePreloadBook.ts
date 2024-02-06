import {reactive} from 'vue'

import {Book} from '@/book'

import {usePreload} from './usePreload'

export function usePreloadBook(book: Book) {
	const preload = usePreload()

	function load() {
		book.pages.forEach(page => {
			preload.fetch(page.src, page.height)
		})

		book.lyrics.forEach(lyric => {
			preload.fetch(lyric.src, 10)
		})
	}

	return reactive({
		progress: preload.progress,
		done: preload.done,
		load,
	})
}
