<script setup lang="ts">
import {useRafFn} from '@vueuse/core'
import chroma from 'chroma-js'
import {vec2} from 'linearly'
import {clamp, range} from 'lodash'
import {computed, onMounted, ref, watch, watchEffect} from 'vue'

import {Lyric} from '@/book'
import {useAppSettingsStore} from '@/store/appSettings'
import {useLyrics} from '@/use/useLyrics'

import Bang from './Bang.vue'

const worker = new Worker(new URL('./Lyrics.worker.ts', import.meta.url), {
	type: 'module',
})

const props = defineProps<{
	lyrics: Lyric[]
	scroll: number
	currentTime: number
	seekbarPosition: number
	mangaScale: number
}>()

const {getLyricsBetween} = useLyrics(computed(() => props.lyrics))

const thresholds = [0.58, 0.03, 0.09, 0.15, 0.433333, 0.716667, 1].map(i =>
	Math.round(i * 255)
)

const LyricAnimationDuration = thresholds.length - 1
const settings = useAppSettingsStore()

const $bang = ref<InstanceType<typeof Bang> | null>(null)

watchEffect(() => {
	worker.postMessage({
		type: 'preloadImages',
		data: props.lyrics.map(lyric => lyric.src),
	})
})

watchEffect(() => {
	worker.postMessage({
		type: 'setPrimaryColor',
		data: chroma(settings.currentTheme.primary).rgb(),
	})
})

const $lyrics = ref<HTMLElement | null>(null)
const canvases: HTMLCanvasElement[] = []

// Update visibleLyrics
const visibleLyrics: (Lyric & {start: number; visible: boolean})[] = []

const LyricDuration = 8

onMounted(() => {
	if ($lyrics.value === null) return

	for (const id of range(50)) {
		const canvas = document.createElement('canvas')
		canvas.classList.add('lyric')
		$lyrics.value.appendChild(canvas)
		canvases.push(canvas)

		const offscreenCanvas = canvas.transferControlToOffscreen()

		worker.postMessage(
			{type: 'sendOffscreenCanvas', data: {id, canvas: offscreenCanvas}},
			[offscreenCanvas]
		)

		visibleLyrics.push({
			time: 0,
			duration: 0,
			src: '',
			offset: vec2.zero,
			size: vec2.zero,
			start: -1,
			visible: false,
		})
	}

	watch(
		() => props.currentTime,
		(time, prevTime) => {
			for (let i = 0; i < visibleLyrics.length; i++) {
				const lyric = visibleLyrics[i]
				visibleLyrics[i].visible =
					time - LyricDuration <= lyric.time && lyric.time <= time
			}

			const doAnimate = prevTime < time && time - prevTime < 1 / 10
			let timeLower: number, timeUpper: number

			if (time > prevTime) {
				timeLower = Math.max(prevTime, time - LyricDuration)
				timeUpper = time
			} else {
				timeLower = time - LyricDuration
				timeUpper = Math.min(prevTime, time + LyricDuration) - LyricDuration
			}

			// Add new lyrics that have just became visible
			const newLyrics = getLyricsBetween(timeLower, timeUpper)

			const start = doAnimate ? Date.now() / 1000 : -1

			for (const lyric of newLyrics) {
				const emptyId = visibleLyrics.findIndex(lyric => !lyric.visible)

				if (emptyId === -1) {
					// eslint-disable-next-line no-console
					console.error('No empty lyric found')
					continue
				}

				visibleLyrics[emptyId] = {...lyric, start, visible: true}
			}

			if (doAnimate) {
				for (const lyric of newLyrics) {
					$bang.value!.bangAt(lyric.offset[0] + Math.floor(lyric.size[0] / 2))
				}
			}

			updateLyrics()
		},
		{flush: 'sync'}
	)
})

const seekbarStyle = computed(() => {
	const top = clamp(
		props.seekbarPosition * props.mangaScale,
		630 * props.mangaScale - props.scroll,
		33184 * props.mangaScale - props.scroll
	)

	return {
		top: `${top}px`,
	}
})

const canvasStatus = new Map<
	number,
	{drawing: boolean; queue?: {src: string; frame: number}}
>()

worker.addEventListener('message', e => {
	const {type, data} = e.data

	if (type === 'lyricDrawn') {
		const id = data as number

		let {drawing, queue} = canvasStatus.get(id) ?? {drawing: false}

		if (queue) {
			worker.postMessage({
				type: 'drawLyric',
				data: {id, src: queue.src, frame: queue.frame},
			})
			queue = undefined
		} else {
			drawing = false
		}

		canvasStatus.set(id, {drawing, queue})
	}
})

const lastDrawnLyric = new Map<number, {src: string; frame: number}>()

function drawLyric(id: number, src: string, frame: number) {
	const lastDrawn = lastDrawnLyric.get(id)
	if (lastDrawn && lastDrawn.src === src && lastDrawn.frame === frame) {
		return
	}

	const {drawing} = canvasStatus.get(id) || {drawing: false}

	if (drawing) {
		canvasStatus.set(id, {drawing, queue: {src, frame}})
		return
	}

	canvasStatus.set(id, {drawing: true})

	worker.postMessage({
		type: 'drawLyric',
		data: {id, src, frame},
	})

	lastDrawnLyric.set(id, {src, frame})
}

function updateLyrics() {
	if ($lyrics.value === null) return

	const now = Date.now() / 1000

	for (let id = 0; id < visibleLyrics.length; id++) {
		const lyric = visibleLyrics[id]

		const canvas = canvases[id]

		canvas.style.visibility = lyric.visible ? 'visible' : 'hidden'

		if (lyric.visible) {
			const elapsed = now - lyric.start
			const frame = Math.min(Math.floor(elapsed * 25), LyricAnimationDuration)

			const left = lyric.offset[0] * props.mangaScale
			const top = lyric.offset[1] * props.mangaScale - props.scroll
			const width = lyric.size[0] * props.mangaScale
			const height = lyric.size[1] * props.mangaScale

			canvas.style.left = `${left}px`
			canvas.style.transform = `translate3d(0, ${top}px, 0)`
			canvas.style.width = `${width}px`
			canvas.style.height = `${height}px`

			drawLyric(id, lyric.src, frame)
		} else {
			drawLyric(id, '', -1)
		}
	}
}

useRafFn(updateLyrics)
</script>

<template>
	<div class="seekbar" :style="seekbarStyle" />
	<Bang ref="$bang" :style="seekbarStyle" />
	<div class="lyric-wrapper" ref="$lyrics" />
</template>

<style lang="stylus" scoped>
.Lyrics
	height 100%

.seekbar
	position absolute
	left 0
	right 0
	height calc(60 * var(--px))
	margin-top calc(-30 * var(--px))
	mask-image url('/assets/seekbar_diffuse.gif')
	mask-size calc(60 * var(--px)) calc(60 * var(--px))
	background-color var(--theme-primary)


.lyric-wrapper
	position relative

:deep(.lyric)
	position absolute
	display block
	top 0
</style>
