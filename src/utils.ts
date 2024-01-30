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
	fnWithTimeDelta: (delta: number | null, ...args: Args) => ReturnType
): [fn: (...args: Args) => ReturnType, reset: () => void] {
	let lastTime: null | number = null

	const fn = (...args: Args) => {
		const now = Date.now() / 1000
		const delta = lastTime !== null ? now - lastTime : null
		lastTime = now
		return fnWithTimeDelta(delta, ...args)
	}

	return [fn, () => (lastTime = null)]
}
