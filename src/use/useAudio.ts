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
			document.addEventListener(eventName, resumeContext)

			function resumeContext() {
				document.removeEventListener(eventName, resumeContext)
				audioContext.resume()
			}
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

		let scrubGain: GainNode = audioContext.createGain()

		scrubGain.connect(masterGain)

		let source: AudioBufferSourceNode | null = null

		let lastDate: number = 0,
			lastTime: number = 0,
			lastRate: number = 0

		let currentTime = 0

		let autoStopTimer: ReturnType<typeof setTimeout> | undefined

		scratch.value = async (time: number) => {
			const now = getNowSeconds()
			const rate = (time - lastTime) / (now - lastDate)

			let limitedRate = rate
			if (Math.abs(rate) > maxRate) {
				limitedRate = Math.sign(rate) * maxRate
			}

			currentTime += (now - lastDate) * lastRate
			const error = Math.abs(time - currentTime)

			if (error > 0.05 || rate * lastRate < 0) {
				disposeSource()
			}

			lastTime = time
			lastDate = new Date().getTime() / 1000
			lastRate = limitedRate

			const buf = rate > 0 ? buffer : revBuffer
			const bufTime = rate > 0 ? time : buf.duration - time

			if (!source) {
				source = recreateAndStartSource(buf, bufTime)
				currentTime = time
			}

			source.playbackRate.value = Math.abs(limitedRate)
			const volume = scalar.fit(Math.abs(1 - rate), 0, 1, 0.1, 1)

			scrubGain.gain.linearRampToValueAtTime(volume, 0.5)

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
			scrubGain.gain.linearRampToValueAtTime(1, 2)
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
			source.connect(scrubGain)

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

				scrubGain.disconnect()
				scrubGain = audioContext.createGain()
				scrubGain.connect(masterGain)
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
