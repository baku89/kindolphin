import {toReactive} from '@vueuse/core'
import {ref} from 'vue'

import {getReversedAudioBuffer} from '@/utils'

function getNowSeconds() {
	return Date.now() / 1000
}

export function useAudio(src: string) {
	const maxRate = 1

	const scratch = ref<(time: number) => void>(() => {})
	const play = ref<(time: number) => void>(() => {})
	const stop = ref<(time: number) => void>(() => {})

	;(async () => {
		const audioContext = new AudioContext()
		const response = await fetch(src)
		const arrayBuffer = await response.arrayBuffer()
		const buffer = await audioContext.decodeAudioData(arrayBuffer)
		const revBuffer = getReversedAudioBuffer(audioContext, buffer)

		let source: AudioBufferSourceNode | null = null

		let lastDate: number = 0,
			lastTime: number = 0,
			lastRate: number = 0

		let autoStop: ReturnType<typeof setTimeout> = 0

		scratch.value = (time: number) => {
			const now = getNowSeconds()
			let rate = (time - lastTime) / (now - lastDate)

			if (Math.abs(rate) > maxRate) {
				rate = Math.sign(rate) * maxRate
			}

			if (source) {
				const estimatedTime = lastTime + lastRate * (now - lastDate)
				const error = Math.abs(time - estimatedTime)

				if (error > 0.1 || rate * lastRate < 0) {
					source.stop()
					source.disconnect()
					source = null
				}
			}

			lastTime = time
			lastDate = new Date().getTime() / 1000
			lastRate = rate

			const buf = rate > 0 ? buffer : revBuffer
			const bufTime = rate > 0 ? time : buf.duration - time

			if (!source) {
				source = audioContext.createBufferSource()
				source.buffer = buf
				source.loop = false
				source.connect(audioContext.destination)
				source.start(0, bufTime)
			}

			source.playbackRate.value = Math.abs(rate)

			clearTimeout(autoStop)
			autoStop = setTimeout(() => {
				source?.stop()
				source?.disconnect()
				source = null
			}, 50)
		}

		play.value = (time: number) => {
			source?.stop()

			source = audioContext.createBufferSource()
			source.buffer = buffer
			source.loop = false
			source.connect(audioContext.destination)
			source.start(0, time)
		}

		stop.value = () => {
			source?.stop()
			source?.disconnect()
			source = null
		}
	})()

	return toReactive({
		scratch,
		play,
		stop,
	})
}
