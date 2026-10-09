import {TimePitchPlayer} from '@arikata-nobuaki/time-pitch-player'
import {toReactive} from '@vueuse/core'
import {scalar} from 'linearly'
import {Ref, ref, watch} from 'vue'

// PROTOTYPE: scratch playback driven by @arikata-nobuaki/time-pitch-player
// instead of the in-house AudioWorklet. Kept API-compatible with the
// original useAudio (scratch / play / stop).
//
// Known gaps versus the in-house worklet (see branch notes):
//   - The player clamps currentTime to [0, duration], so the pre-song
//     blank zone (negative time) is emulated by pausing at 0.
//   - Speed is sent as a message, not an a-rate AudioParam, so there is no
//     native linear ramp between setSpeed calls.
//   - The player owns its AudioContext and GainNode; volume changes are
//     instantaneous (no 250ms fade).

const AUDIO_OFFSET_SECONDS = 0.68
const SCRATCH_MAX_RATE = 1
const SEEK_THRESHOLD_SECONDS = 0.01
const AUTO_STOP_MS = 50

function getNowSeconds() {
	return Date.now() / 1000
}

export function useAudio(src: string, {volume}: {volume: Ref<number>}) {
	const scratch = ref<(time: number) => void>(() => {})
	const play = ref<(time: number) => void>(() => {})
	const stop = ref<() => void>(() => {})

	;(async () => {
		const player = new TimePitchPlayer()
		player.pitchFollowsSpeed = true
		// Start silent: play() is only used to resume the AudioContext.
		player.playbackRate = 0
		player.onerror = msg => console.error('[time-pitch-player]', msg)

		;(window as any).__tpPlayer = player // prototype debug hook
		await player.loadUrl(src, 'song')

		// The package resumes its AudioContext inside play(); we need the
		// same for scratching, so prime it on the first user gesture.
		const eventName =
			typeof document.ontouchend !== 'undefined' ? 'touchend' : 'mouseup'
		document.addEventListener(eventName, () => void player.play(), {
			once: true,
		})

		watch(volume, v => (player.volume = v), {immediate: true})

		function seek(time: number) {
			player.currentTime = Math.max(0, time - AUDIO_OFFSET_SECONDS)
		}

		function setSpeed(value: number) {
			player.playbackRate = value
		}

		let prevTime = 0
		let prevRate = 0
		let lastTargetTime = 0
		let predictedTime = 0
		let autoStopTimer: ReturnType<typeof setTimeout> | undefined

		scratch.value = (targetTime: number) => {
			const now = getNowSeconds()
			const dt = now - prevTime
			const isFirstCall = prevTime === 0 || dt <= 0 || dt > 1

			const unboundRate = isFirstCall ? 0 : (targetTime - lastTargetTime) / dt
			const rate = scalar.clamp(
				unboundRate,
				-SCRATCH_MAX_RATE,
				SCRATCH_MAX_RATE
			)

			if (!isFirstCall) predictedTime += dt * prevRate

			const directionReversed = rate * prevRate < 0
			const error = Math.abs(targetTime - predictedTime)

			lastTargetTime = targetTime
			prevTime = now
			prevRate = rate

			if (isFirstCall || directionReversed || error > SEEK_THRESHOLD_SECONDS) {
				seek(targetTime)
				predictedTime = targetTime
			}

			// Blank zone emulation: the player cannot sit at a negative
			// position, so hold it silent at 0 until the cursor enters the song.
			const inBlank = targetTime < AUDIO_OFFSET_SECONDS
			setSpeed(inBlank ? 0 : rate)
			if (!player.playing) void player.play()

			clearTimeout(autoStopTimer)
			autoStopTimer = setTimeout(() => {
				setSpeed(0)
				autoStopTimer = undefined
			}, AUTO_STOP_MS)
		}

		play.value = (time: number) => {
			seek(time)
			setSpeed(1)
			void player.play()

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

	return toReactive({scratch, play, stop})
}
