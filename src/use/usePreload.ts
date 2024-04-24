import {computed, ref, watch} from 'vue'

const cacheURLs = new Map<string, string>()

export function getCachedURL(url: string) {
	return cacheURLs.get(url)!
}

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
			loadedWeight.value = weightsTotal.value
		}
	})

	async function fetchResource(url: string, weight: number) {
		weightsTotal.value += weight
		remainingTasks.value++

		const xhr = new XMLHttpRequest()
		xhr.open('GET', url, true)
		xhr.responseType = 'blob'

		let lastLoaded = 0

		xhr.onprogress = e => {
			if (e.lengthComputable) {
				loadedWeight.value += ((e.loaded - lastLoaded) / e.total) * weight
				lastLoaded = e.loaded
			}
		}

		xhr.ontimeout =
			xhr.onerror =
			xhr.onabort =
				() => {
					loadedWeight.value += weight
					remainingTasks.value--
				}

		xhr.onload = () => {
			if (lastLoaded === 0) {
				loadedWeight.value += weight
			}

			const cacheURL = URL.createObjectURL(xhr.response)
			cacheURLs.set(url, cacheURL)

			remainingTasks.value--
		}

		xhr.send()
	}

	return {
		fetch: fetchResource,
		progress,
		done,
	}
}
