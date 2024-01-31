import {toReactive} from '@vueuse/core'
import {computed, ref, watch} from 'vue'

export function usePreload() {
	const loadedWeight = ref(0)
	const weightsTotal = ref(0)
	const remainingTasks = ref(0)

	const progress = computed(() => {
		if (weightsTotal.value === 0) {
			return 0
		}
		if (weightsTotal.value > 0 && remainingTasks.value === 0) {
			return 1
		}
		return loadedWeight.value / weightsTotal.value
	})

	const done = ref(false)

	watch(remainingTasks, remaining => {
		if (remaining === 0) {
			done.value = true
		}
	})

	async function fetchResource(url: string, weight: number) {
		weightsTotal.value += weight
		remainingTasks.value++

		const xhr = new XMLHttpRequest()
		xhr.open('GET', url)

		let lastLoaded = 0

		xhr.onprogress = e => {
			if (e.lengthComputable) {
				loadedWeight.value += ((e.loaded - lastLoaded) / e.total) * weight
				lastLoaded = e.loaded
			}
		}

		xhr.onload = () => {
			remainingTasks.value--
		}

		xhr.send()
	}

	async function fetchImage(src: string, weight: number) {
		const img = new Image()
		let lastLoaded = 0
		let hasProgressCalled = false

		img.onprogress = e => {
			if (e.lengthComputable) {
				hasProgressCalled = true
				loadedWeight.value += ((e.loaded - lastLoaded) / e.total) * weight
				lastLoaded = e.loaded
			}
		}

		img.onload = () => {
			if (!hasProgressCalled) {
				loadedWeight.value += weight
			}
			remainingTasks.value--
		}
		img.src = src
		weightsTotal.value += weight
		remainingTasks.value++
	}

	return toReactive({
		fetch: fetchResource,
		fetchImage,
		progress,
		done,
	})
}
