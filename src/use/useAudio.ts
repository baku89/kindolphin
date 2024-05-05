import {toReactive} from '@vueuse/core'
import {scalar} from 'linearly'
import {clamp} from 'lodash'
import {Ref, ref, watch} from 'vue'

import {getReversedAudioBuffer} from '@/utils'

function getNowSeconds() {
	return Date.now() / 1000
}

export function useAudio(src: string, {volume}: {volume: Ref<number>}) {
	const maxRate = 1

	const scratch = ref<(time: number) => void>(() => {})
	const play = ref<(time: number) => void>(() => {})
	const stop = ref<() => void>(() => {})

	;(async () => {
		const audioContext = new AudioContext()
		const response = await fetch(src)
		const arrayBuffer = await response.arrayBuffer()
		const buffer = await audioContext.decodeAudioData(arrayBuffer)
		const revBuffer = getReversedAudioBuffer(audioContext, buffer)

		document.addEventListener('visibilitychange', () => {
			if (document.visibilityState === 'visible') {
				resumeAudioContext()
			}
		})

		function resumeAudioContext() {
			// https://qiita.com/zprodev/items/7fcd8335d7e8e613a01f
			const eventName =
				typeof document.ontouchend !== 'undefined' ? 'touchend' : 'mouseup'
			document.addEventListener(eventName, audioContext.resume, {once: true})
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

		let scratchGain: GainNode = audioContext.createGain()

		scratchGain.connect(masterGain)

		let source: AudioBufferSourceNode | null = null

		let prevTime = 0,
			prevRate = 0,
			lastTargetTime = 0

		let currentTime = 0

		let autoStopTimer: ReturnType<typeof setTimeout> | undefined

		scratch.value = async (targetTime: number) => {
			const now = getNowSeconds()
			const unboundRate = (targetTime - lastTargetTime) / (now - prevTime)
			const rate = scalar.clamp(unboundRate, -maxRate, maxRate)

			currentTime += (now - prevTime) * prevRate

			lastTargetTime = targetTime
			prevTime = now
			prevRate = rate

			// When the difference between target and current times exceeds the
			// threshold or the playback direction has inverted,
			// just seek to the target time
			const error = Math.abs(targetTime - currentTime)

			if (error > 0.025 || rate * prevRate < 0) {
				disposeSource()
			}

			if (!source) {
				const currentBuffer = rate > 0 ? buffer : revBuffer
				const timeInBuffer =
					unboundRate > 0 ? targetTime : currentBuffer.duration - targetTime

				source = recreateAndStartSource(currentBuffer, timeInBuffer)
				currentTime = targetTime
			}

			// Update the playback rate and volume
			source.playbackRate.value = Math.abs(rate)
			const volume = scalar.fit(Math.abs(1 - unboundRate), 0, 1, 1, 1)

			scratchGain.gain.linearRampToValueAtTime(
				volume,
				audioContext.currentTime + 0.5
			)

			clearTimeout(autoStopTimer)
			autoStopTimer = setTimeout(disposeSource, 50)
		}

		play.value = (time: number) => {
			if (autoStopTimer === undefined) {
				masterGain.gain.value = 0
				masterGain.gain.linearRampToValueAtTime(
					volume.value,
					audioContext.currentTime + 0.25
				)
			}

			recreateAndStartSource(buffer, time)
			scratchGain.gain.linearRampToValueAtTime(1, audioContext.currentTime + 2)
		}

		stop.value = () => {
			disposeSource()
		}

		let startTimer: ReturnType<typeof setTimeout>

		function recreateAndStartSource(buf: AudioBuffer, time: number) {
			disposeSource()

			const delay = Math.max(0, -time)

			source = audioContext.createBufferSource()
			source.buffer = buf
			source.loop = false
			source.connect(scratchGain)

			if (time > 0) {
				source.start(0, clamp(time, 0, buf.duration))
			} else {
				startTimer = setTimeout(() => {
					source?.start(0, clamp(time, 0, buf.duration))
				}, delay * 1000)
			}

			return source
		}

		function disposeSource() {
			clearTimeout(autoStopTimer)
			autoStopTimer = undefined
			clearTimeout(startTimer)

			try {
				source?.stop()
				source?.disconnect()

				scratchGain.disconnect()
				scratchGain = audioContext.createGain()
				scratchGain.connect(masterGain)
			} catch (e) {
				null
			} finally {
				source = null
			}
		}
	})()

	return toReactive({
		scratch,
		play,
		stop,
	})
}
