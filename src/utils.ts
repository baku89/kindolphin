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
