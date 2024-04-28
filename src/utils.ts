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

export async function fetchGzip(url: string) {
	const res = await fetch(url)

	const contentType = res.headers.get('content-type')

	if (contentType === 'application/x-gzip') {
		// Decompress the buffer
		const bs = new DecompressionStream('gzip')
		const stream = (await res.blob()).stream().pipeThrough(bs)
		return await new Response(stream).arrayBuffer()
	} else {
		return await res.arrayBuffer()
	}
}
