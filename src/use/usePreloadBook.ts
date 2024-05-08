import {reactive} from 'vue'

import {Book} from '@/book'

import {usePreload} from './usePreload'

export function usePreloadBook(book: Book) {
	const preload = usePreload()

	let hasStarted = false

	function load() {
		if (hasStarted) {
			return
		}
		hasStarted = true

		preload.fetch('./assets/group_inou - HAPPY - 03 HAPPENING.mp3', 300)
		preload.fetch('./assets/scroll_effect_line.webp', 200)

		book.pages.forEach((page, i) => {
			setTimeout(() => preload.fetch(page.src, page.height), i)
		})

		preload.fetch(book.lyricSrc, 300)
	}

	return reactive({
		progress: preload.progress,
		done: preload.done,
		load,
	})
}
