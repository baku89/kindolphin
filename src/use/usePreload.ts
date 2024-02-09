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
			loadedWeight.value = weightsTotal.value
		}
	})

	async function fetchResource(url: string, weight: number) {
		weightsTotal.value += weight
		remainingTasks.value++

		const xhr = new XMLHttpRequest()
		xhr.open('GET', url)

		let lastLoaded = 0

		console.info('[Preload] start', url)

		xhr.onprogress = e => {
			console.info(
				'[Preload] progress',
				url,
				e.lengthComputable,
				e.loaded,
				e.total
			)
			if (e.lengthComputable) {
				loadedWeight.value += ((e.loaded - lastLoaded) / e.total) * weight
				lastLoaded = e.loaded
			}
		}

		xhr.ontimeout =
			xhr.onerror =
			xhr.onabort =
				() => {
					console.info('[Preload] onerror', url)
					loadedWeight.value += weight
					remainingTasks.value--
				}

		xhr.onload = () => {
			if (lastLoaded === 0) {
				loadedWeight.value += weight
			}
			remainingTasks.value--
			console.info('[Preload] onload', url, loadedWeight.value)
		}

		xhr.send()
	}

	return {
		fetch: fetchResource,
		progress,
		done,
	}
}
