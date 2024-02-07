<script setup lang="ts">
import {useRafFn} from '@vueuse/core'
import chroma from 'chroma-js'
import {computed, ref, watch, watchEffect} from 'vue'

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

watch(
	() => props.currentTime,
	(time, prevTime) => {
		const lyrics = [...visibleLyrics.value]

		const doAnimate = prevTime < time && time - prevTime < 1 / 10
		let timeLower: number, timeUpper: number

		if (time > prevTime) {
			timeLower = Math.max(prevTime, time - 8)
			timeUpper = time
		} else {
			timeLower = time - 8
			timeUpper = Math.max(prevTime, time - 8) - 8
		}

		// Add new lyrics that have just became visible
		const newLyrics = getLyricsBetween(timeLower, timeUpper)

		const start = doAnimate ? Date.now() / 1000 : -1

		lyrics.push(...newLyrics.map(l => ({...l, start})))

		if (doAnimate) {
			for (const lyric of newLyrics) {
				$bang.value!.bangAt(lyric.offset[0] + Math.floor(lyric.size[0] / 2))
			}
		}
		// Remove lyrics that are no longer visible
		visibleLyrics.value = lyrics.filter(
			lyric => time - 8 <= lyric.time && lyric.time <= time
		)
	},
	{flush: 'sync'}
)

const visibleLyrics = ref<(Lyric & {start: number})[]>([])

const visibleLyricSprites = computed(() => {
	return visibleLyrics.value.map(lyric => {
		return {
			start: lyric.start,
			src: lyric.src,
			size: lyric.size,
			style: {
				left: `calc(${lyric.offset[0]} * var(--px))`,
				transform: `translate3d(0, calc(${lyric.offset[1]} * var(--px) - ${props.scroll}px), 0)`,
				width: `calc(${lyric.size[0]} * var(--px))`,
				height: `calc(${lyric.size[1]} * var(--px))`,
			},
		}
	})
})

watch(visibleLyricSprites, updateLyrics, {flush: 'sync'})

const seekbarStyle = computed(() => {
	return {
		top: `calc(${props.seekbarPosition} * var(--px))`,
	}
})

const $lyrics = ref<HTMLElement | null>(null)
const canvases: HTMLCanvasElement[] = []

function updateLyrics() {
	if ($lyrics.value === null) return

	const now = Date.now() / 1000

	for (let id = 0; id < visibleLyricSprites.value.length; id++) {
		const sprite = visibleLyricSprites.value[id]

		let canvas: HTMLCanvasElement
		if (id >= canvases.length) {
			canvas = document.createElement('canvas')
			canvas.classList.add('lyric')
			$lyrics.value.appendChild(canvas)

			const offscreenCanvas = canvas.transferControlToOffscreen()

			worker.postMessage(
				{type: 'sendOffscreenCanvas', data: {id, canvas: offscreenCanvas}},
				[offscreenCanvas]
			)

			canvases.push(canvas)
		} else {
			canvas = canvases[id]
		}

		const elapsed = now - sprite.start
		const frame = Math.min(Math.floor(elapsed * 25), LyricAnimationDuration)

		canvas.style.left = sprite.style.left
		canvas.style.transform = sprite.style.transform
		canvas.style.width = sprite.style.width
		canvas.style.height = sprite.style.height
		canvas.style.visibility = 'visible'

		worker.postMessage({
			type: 'drawLyric',
			data: {id, src: sprite.src, frame},
		})
	}

	for (let i = visibleLyricSprites.value.length; i < canvases.length; i++) {
		canvases[i].style.visibility = 'hidden'
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
	left calc(-30 * var(--px))
	right calc(-30 * var(--px))
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
