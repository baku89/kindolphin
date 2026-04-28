import {toReactive} from '@vueuse/core'
import {scalar} from 'linearly'
import {Ref, ref, watch} from 'vue'

// `new URL(..., import.meta.url)` is Vite's canonical pattern for
// referencing a static asset. The `.js` source is emitted verbatim into
// the build output and `addModule()` loads it as a plain script in
// AudioWorkletGlobalScope.
//
// We deliberately avoid `?worker&url`: that bundles the file as a Web
// Worker (with `self`-based glue code), which dev mode tolerates because
// the module is served on the fly, but production fails because the glue
// code references globals that don't exist in AudioWorkletGlobalScope.
const scratchProcessorUrl = new URL(
	'../audio/scratch-processor.js',
	import.meta.url
).href

// Compensation for the silent priming samples present at the head of the
// MP3 file (a.k.a. encoder delay). Must match the value baked into the
// content's timeline.
const AUDIO_OFFSET_SECONDS = 0.68

// Maximum |speed| while scratching. Capped to 1 so the pitch can only drop,
// never rise -- a deliberate trait of this scratch effect.
const SCRATCH_MAX_RATE = 1

// Threshold (seconds) above which we hard-seek the cursor instead of letting
// the variable speed catch up.
const SEEK_THRESHOLD_SECONDS = 0.025

// If no scratch input arrives within this window, the playback is paused.
const AUTO_STOP_MS = 50

// Tiny ramp window applied to every speed change. At 5ms this is below the
// threshold where humans hear a "glide" between pitches, so scratching
// still feels instant -- but it eliminates the click that an abrupt
// setValueAtTime can produce at process-block boundaries (where the speed
// would otherwise jump discontinuously between blocks). The seek crossfade
// inside scratch-processor.ts uses the same window for the same reason.
const SPEED_RAMP_SECONDS = 0.005

function getNowSeconds() {
	return Date.now() / 1000
}

export function useAudio(src: string, {volume}: {volume: Ref<number>}) {
	const scratch = ref<(time: number) => void>(() => {})
	const play = ref<(time: number) => void>(() => {})
	const stop = ref<() => void>(() => {})

	;(async () => {
		const audioContext = new AudioContext()

		// AudioWorklet module + audio file are loaded in parallel.
		const [, buffer] = await Promise.all([
			audioContext.audioWorklet.addModule(scratchProcessorUrl),
			fetch(src)
				.then(res => res.arrayBuffer())
				.then(buf => audioContext.decodeAudioData(buf)),
		])

		document.addEventListener('visibilitychange', () => {
			if (document.visibilityState === 'visible') {
				resumeAudioContext()
			}
		})

		function resumeAudioContext() {
			// https://qiita.com/zprodev/items/7fcd8335d7e8e613a01f
			// Wrap in an arrow fn so `this` inside resume() is the AudioContext.
			// Passing `audioContext.resume` directly loses the binding and throws
			// "Illegal invocation" when the listener fires.
			const eventName =
				typeof document.ontouchend !== 'undefined' ? 'touchend' : 'mouseup'
			document.addEventListener(eventName, () => audioContext.resume(), {
				once: true,
			})
		}

		resumeAudioContext()

		const masterGain = audioContext.createGain()
		masterGain.connect(audioContext.destination)

		watch(volume, (volume, prevVolume) => {
			if (volume < prevVolume) {
				masterGain.gain.value = volume
			} else {
				masterGain.gain.linearRampToValueAtTime(
					volume,
					audioContext.currentTime + 0.25
				)
			}
		})

		const sampleRate = buffer.sampleRate
		const numChannels = buffer.numberOfChannels

		// Copy each channel into its own ArrayBuffer so we can transfer
		// ownership to the AudioWorklet without copying.
		const channelBuffers: ArrayBuffer[] = []
		for (let ch = 0; ch < numChannels; ch++) {
			channelBuffers.push(buffer.getChannelData(ch).slice().buffer)
		}

		const scratchNode = new AudioWorkletNode(
			audioContext,
			'scratch-processor',
			{
				numberOfInputs: 0,
				numberOfOutputs: 1,
				outputChannelCount: [numChannels],
			}
		)
		scratchNode.connect(masterGain)

		scratchNode.port.postMessage(
			{type: 'load', channels: channelBuffers},
			channelBuffers
		)

		const speedParam = scratchNode.parameters.get('speed') as AudioParam

		// `time` is in user-facing seconds; cursor uses sample index in the
		// raw buffer, offset by the encoder-delay compensation.
		function timeToCursor(time: number) {
			return (time - AUDIO_OFFSET_SECONDS) * sampleRate
		}

		function seek(time: number) {
			scratchNode.port.postMessage({
				type: 'seek',
				cursor: timeToCursor(time),
			})
		}

		function setSpeed(value: number) {
			// 5ms linear ramp instead of an instant setValueAtTime. The
			// duration is below the perceptual threshold for pitch glides
			// (~20ms) so scratching still feels immediate, but it removes
			// the inter-block step discontinuity that produces clicks.
			//
			// `cancelAndHoldAtTime` (rather than `cancelScheduledValues`) is
			// the spec-canonical way to begin a new automation segment from
			// the param's current value: it pins whatever value the param
			// holds at `t` as the implicit anchor for the linearRamp that
			// follows. Without an anchor, some implementations leave the
			// ramp's start undefined.
			const t = audioContext.currentTime
			speedParam.cancelAndHoldAtTime(t)
			speedParam.linearRampToValueAtTime(value, t + SPEED_RAMP_SECONDS)
		}

		// State for tracking the cursor between scratch() invocations.
		let prevTime = 0
		let prevRate = 0
		let lastTargetTime = 0
		let predictedTime = 0
		let autoStopTimer: ReturnType<typeof setTimeout> | undefined

		scratch.value = (targetTime: number) => {
			const now = getNowSeconds()
			const dt = now - prevTime

			// Skip the first call (no meaningful dt) by treating it as a seek.
			const isFirstCall = prevTime === 0 || dt <= 0 || dt > 1

			const unboundRate = isFirstCall ? 0 : (targetTime - lastTargetTime) / dt
			const rate = scalar.clamp(
				unboundRate,
				-SCRATCH_MAX_RATE,
				SCRATCH_MAX_RATE
			)

			if (!isFirstCall) {
				predictedTime += dt * prevRate
			}

			const directionReversed = rate * prevRate < 0
			const error = Math.abs(targetTime - predictedTime)

			lastTargetTime = targetTime
			prevTime = now
			prevRate = rate

			if (isFirstCall || directionReversed || error > SEEK_THRESHOLD_SECONDS) {
				seek(targetTime)
				predictedTime = targetTime
			}

			setSpeed(rate)

			clearTimeout(autoStopTimer)
			autoStopTimer = setTimeout(() => {
				setSpeed(0)
				autoStopTimer = undefined
			}, AUTO_STOP_MS)
		}

		play.value = (time: number) => {
			// Coming from a fully stopped state -- fade the master gain in to
			// avoid an audible pop.
			if (autoStopTimer === undefined) {
				masterGain.gain.value = 0
				masterGain.gain.linearRampToValueAtTime(
					volume.value,
					audioContext.currentTime + 0.25
				)
			}

			seek(time)
			setSpeed(1)

			// Reset the scratch tracking state so a subsequent scratch() call
			// computes its delta from this playback start point.
			prevTime = getNowSeconds()
			prevRate = 1
			lastTargetTime = time
			predictedTime = time

			clearTimeout(autoStopTimer)
			autoStopTimer = undefined
		}

		stop.value = () => {
			setSpeed(0)
			clearTimeout(autoStopTimer)
			autoStopTimer = undefined
			prevRate = 0
		}
	})()

	return toReactive({
		scratch,
		play,
		stop,
	})
}
