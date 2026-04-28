// AudioWorklet processor that plays back an audio buffer at a variable signed
// rate. The "speed" AudioParam acts like a signed playbackRate:
//   speed =  1 -> normal playback
//   speed =  0 -> paused
//   speed = -1 -> reverse playback at normal speed
//
// The processor never loops or wraps the cursor; samples outside the buffer
// boundaries are emitted as silence. This way the cursor can be seeked to a
// negative position (the manga's pre-song "blank" zone) and the song will
// naturally start once the cursor reaches sample 0.
//
// The pitch is intentionally capped to the original (|speed| <= 1) so that
// quick scratching can only drop the pitch, never raise it -- a deliberate
// quirk we want to preserve.

// `AudioWorkletProcessor` and `registerProcessor` only exist in the
// AudioWorkletGlobalScope and are not part of TS's bundled DOM lib. Declare
// the minimal surface we need locally to keep the file self-contained.
declare abstract class AudioWorkletProcessor {
	readonly port: MessagePort
	constructor(options?: AudioWorkletNodeOptions)
	abstract process(
		inputs: Float32Array[][],
		outputs: Float32Array[][],
		parameters: Record<string, Float32Array>
	): boolean
}

declare function registerProcessor(
	name: string,
	ctor: new (options?: AudioWorkletNodeOptions) => AudioWorkletProcessor
): void

interface LoadMessage {
	type: 'load'
	channels: ArrayBuffer[]
}

interface SeekMessage {
	type: 'seek'
	cursor: number
}

type IncomingMessage = LoadMessage | SeekMessage

const SPEED_MAX = 1

class ScratchProcessor extends AudioWorkletProcessor {
	private channels: Float32Array[] = []
	private cursor = 0
	private lastSampleIndex = -1

	static get parameterDescriptors() {
		return [
			{
				name: 'speed',
				defaultValue: 0,
				minValue: -SPEED_MAX,
				maxValue: SPEED_MAX,
				automationRate: 'a-rate',
			},
		]
	}

	constructor() {
		super()

		this.port.onmessage = (e: MessageEvent<IncomingMessage>) => {
			const data = e.data
			if (!data) return

			if (data.type === 'load') {
				this.channels = data.channels.map(b => new Float32Array(b))
				this.lastSampleIndex = this.channels[0]
					? this.channels[0].length - 1
					: -1
			} else if (data.type === 'seek') {
				this.cursor = data.cursor
			}
		}
	}

	process(
		_inputs: Float32Array[][],
		outputs: Float32Array[][],
		parameters: Record<string, Float32Array>
	): boolean {
		const output = outputs[0]
		if (!output || output.length === 0) return true
		if (this.channels.length === 0) return true

		const speeds = parameters.speed
		const isConstant = speeds.length === 1
		const numSamples = output[0].length
		const numOutChannels = output.length
		const lastSampleIndex = this.lastSampleIndex

		for (let i = 0; i < numSamples; i++) {
			const cursor = this.cursor

			if (cursor < 0 || cursor > lastSampleIndex) {
				// Out of buffer range: emit silence but keep advancing the cursor
				// so seeking to a negative position naturally fades into playback.
				for (let ch = 0; ch < numOutChannels; ch++) {
					output[ch][i] = 0
				}
			} else {
				const idx0 = cursor | 0
				const idx1 = idx0 < lastSampleIndex ? idx0 + 1 : idx0
				const frac = cursor - idx0

				for (let ch = 0; ch < numOutChannels; ch++) {
					const src = this.channels[ch] ?? this.channels[0]
					const a = src[idx0]
					const b = src[idx1]
					output[ch][i] = a + (b - a) * frac
				}
			}

			const speed = isConstant ? speeds[0] : speeds[i]
			this.cursor += speed
		}

		return true
	}
}

registerProcessor('scratch-processor', ScratchProcessor)
