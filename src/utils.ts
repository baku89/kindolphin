export function getReversedAudioBuffer(
	audioContext: AudioContext,
	buf: AudioBuffer
) {
	const revBuf = audioContext.createBuffer(
		buf.numberOfChannels,
		buf.length,
		buf.sampleRate
	)
	for (let i = 0; i < buf.numberOfChannels; i++) {
		revBuf.getChannelData(i).set(buf.getChannelData(i).slice().reverse())
	}
	return revBuf
}

export function withTimeDelta<Args extends unknown[], ReturnType>(
	fnWithTimeDelta: (delta: number, ...args: Args) => ReturnType
): [fn: (...args: Args) => ReturnType, reset: () => void] {
	let lastTime: null | number = null

	const fn = (...args: Args) => {
		const now = Date.now() / 1000
		const delta = lastTime !== null ? now - lastTime : 0
		lastTime = now
		return fnWithTimeDelta(delta, ...args)
	}

	return [fn, () => (lastTime = null)]
}

export function binarySearchBound<T, U>(
	arr: T[],
	lower: U,
	upper: U,
	cmp: (t: T, u: U) => number
): T[] {
	let left = 0
	let right = arr.length - 1

	while (left < right) {
		const mid = Math.floor((left + right) / 2)
		if (cmp(arr[mid], lower) <= 0) {
			left = mid + 1
		} else {
			right = mid
		}
	}

	const result: T[] = []

	while (left < arr.length && cmp(arr[left], upper) <= 0) {
		result.push(arr[left])
		left++
	}

	return result
}
