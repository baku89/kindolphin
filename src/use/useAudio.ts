import {toReactive} from '@vueuse/core'
import {scalar} from 'linearly'
import {clamp} from 'lodash'
import {Ref, ref, watchEffect} from 'vue'

import {getReversedAudioBuffer} from '@/utils'

function getNowSeconds() {
	return Date.now() / 1000
}

export function useAudio(src: string, volume: Ref<number>) {
	const maxRate = 1

	const scratch = ref<(time: number) => void>(() => {})
	const play = ref<(time: number) => void>(() => {})
	const stop = ref<() => void>(() => {})
	const preliminaryPlay = ref<() => void>(() => {})

	;(async () => {
		const audioContext = new AudioContext()
		const response = await fetch(src)
		const arrayBuffer = await response.arrayBuffer()
		const buffer = await audioContext.decodeAudioData(arrayBuffer)
		const revBuffer = getReversedAudioBuffer(audioContext, buffer)

		const masterGain = audioContext.createGain()
		masterGain.connect(audioContext.destination)

		watchEffect(() => {
			masterGain.gain.linearRampToValueAtTime(volume.value, 0.25)
		})

		const scrubGain = audioContext.createGain()
		scrubGain.connect(masterGain)

		let source: AudioBufferSourceNode | null = null

		let lastDate: number = 0,
			lastTime: number = 0,
			lastRate: number = 0

		let currentTime = 0

		let autoStop: ReturnType<typeof setTimeout>

		scratch.value = (time: number) => {
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
				source = createAndStartSource(buf, bufTime)
				currentTime = time
			}

			source.playbackRate.value = Math.abs(limitedRate)
			const volume = scalar.fit(Math.abs(1 - rate), 0, 1, 0.1, 1)

			scrubGain.gain.linearRampToValueAtTime(volume, 0.5)

			clearTimeout(autoStop)
			autoStop = setTimeout(disposeSource, 50)
		}

		play.value = (time: number) => {
			clearTimeout(autoStop)
			disposeSource()

			createAndStartSource(buffer, time)
			scrubGain.gain.linearRampToValueAtTime(1, 2)
		}

		stop.value = () => {
			disposeSource()
			clearTimeout(autoStop)
		}

		preliminaryPlay.value = () => {
			source = audioContext.createBufferSource()
			source.buffer = buffer
			source.loop = false
			source.connect(scrubGain)
			source.start(0, 0, 0.5)
		}

		let startTimer: ReturnType<typeof setTimeout>
		let hasStarted = false
		function createAndStartSource(buf: AudioBuffer, time: number) {
			const delay = Math.max(0, -time)
			hasStarted = false

			source = audioContext.createBufferSource()
			source.buffer = buf
			source.loop = false
			source.connect(scrubGain)

			if (time > 0) {
				source.start(0, clamp(time, 0, buf.duration))
				hasStarted = true
			} else {
				startTimer = setTimeout(() => {
					hasStarted = true
					source?.start(0, clamp(time, 0, buf.duration))
				}, delay * 1000)
			}

			return source
		}

		function disposeSource() {
			clearTimeout(startTimer)
			if (hasStarted) {
				source?.stop()
			}
			source?.disconnect()
			source = null
		}
	})()

	return toReactive({
		scratch,
		play,
		stop,
		preliminaryPlay,
	})
}
