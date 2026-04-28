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
//
// This file is plain JavaScript (not TypeScript) on purpose. AudioWorklet
// modules must be loadable by `audioContext.audioWorklet.addModule(url)` as
// AudioWorkletGlobalScope-compatible scripts. Going through Vite's
// `?worker&url` transform produces a Web Worker bundle that injects
// `self`-based glue code, which works in dev but breaks in production when
// loaded into AudioWorkletGlobalScope (no `self`, no `Worker`, etc.).
// Keeping this as `.js` lets Vite emit it verbatim as a static asset.

const SPEED_MAX = 1

// Crossfade window applied after every cursor jump (`seek`). 5ms is short
// enough to feel instantaneous but long enough to mask the step
// discontinuity in the waveform that would otherwise click. Matches the
// speed-param ramp window on the JS side.
const SEEK_CROSSFADE_SECONDS = 0.005

class ScratchProcessor extends AudioWorkletProcessor {
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

		this.channels = []
		this.cursor = 0
		this.lastSampleIndex = -1

		// Crossfade state. `oldCursor` keeps reading from the pre-seek
		// position while `cursor` reads from the new one; we blend them
		// over the next `fadeRemaining` samples. fadeRemaining=0 means no
		// fade in flight.
		this.oldCursor = 0
		this.fadeRemaining = 0
		this.fadeLength = Math.max(
			1,
			Math.round(SEEK_CROSSFADE_SECONDS * sampleRate)
		)

		this.port.onmessage = e => {
			const data = e.data
			if (!data) return

			if (data.type === 'load') {
				this.channels = data.channels.map(b => new Float32Array(b))
				this.lastSampleIndex = this.channels[0]
					? this.channels[0].length - 1
					: -1
			} else if (data.type === 'seek') {
				// Remember where we were reading so the next `fadeLength`
				// samples can crossfade out of it. Without this, the cursor
				// jump produces a step in the waveform that's audible as a
				// click -- especially on direction reversal and large drift
				// corrections during fast scrubbing.
				this.oldCursor = this.cursor
				this.cursor = data.cursor
				this.fadeRemaining = this.fadeLength
			}
		}
	}

	sampleAt(cursor, ch) {
		const lastSampleIndex = this.lastSampleIndex
		if (cursor < 0 || cursor > lastSampleIndex) return 0
		const idx0 = cursor | 0
		const idx1 = idx0 < lastSampleIndex ? idx0 + 1 : idx0
		const frac = cursor - idx0
		const src = this.channels[ch] ?? this.channels[0]
		return src[idx0] + (src[idx1] - src[idx0]) * frac
	}

	process(_inputs, outputs, parameters) {
		const output = outputs[0]
		if (!output || output.length === 0) return true
		if (this.channels.length === 0) return true

		const speeds = parameters.speed
		const isConstant = speeds.length === 1
		const numSamples = output[0].length
		const numOutChannels = output.length
		const fadeLength = this.fadeLength

		for (let i = 0; i < numSamples; i++) {
			const speed = isConstant ? speeds[0] : speeds[i]
			const fading = this.fadeRemaining > 0

			for (let ch = 0; ch < numOutChannels; ch++) {
				const newSample = this.sampleAt(this.cursor, ch)
				if (fading) {
					const oldSample = this.sampleAt(this.oldCursor, ch)
					// 0 at start of fade -> mostly old sample;
					// approaches 1 by the last sample -> mostly new.
					const t = 1 - this.fadeRemaining / fadeLength
					output[ch][i] = oldSample * (1 - t) + newSample * t
				} else {
					output[ch][i] = newSample
				}
			}

			this.cursor += speed
			if (fading) {
				this.oldCursor += speed
				this.fadeRemaining--
			}
		}

		return true
	}
}

registerProcessor('scratch-processor', ScratchProcessor)
