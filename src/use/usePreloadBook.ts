import {reactive} from 'vue'

import {Book} from '@/book'

import {usePreload} from './usePreload'

export function usePreloadBook(book: Book) {
	const preload = usePreload()

	function load() {
		preload.fetch('./assets/happening.mp3', 300)

		book.pages.forEach(page => {
			preload.fetch(page.src, page.height)
		})

		preload.fetch(book.lyricSrc, 300)
	}

	return reactive({
		progress: preload.progress,
		done: preload.done,
		load,
	})
}
