<script setup lang="ts">
import {useRafFn} from '@vueuse/core'
import {BSON} from 'bson'
import chroma from 'chroma-js'
import {vec2} from 'linearly'
import {clamp, range} from 'lodash'
import {computed, onMounted, ref, watch, watchEffect} from 'vue'

import {Lyric} from '@/book'
import {useAppSettingsStore} from '@/store/appSettings'
import {useLyrics} from '@/use/useLyrics'

import Bang from './Bang.vue'

const props = defineProps<{
	lyricsSrc: string
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

// Drawing logic
const primaryRGB = computed(() => {
	return chroma(settings.currentTheme.primary).rgb()
})

const bitmaps: Map<number, Uint8Array> = new Map()

const contexts = new Map<
	number,
	{ctx: CanvasRenderingContext2D; pix: ImageData}
>()

watchEffect(async () => {
	console.time('Fetching BSON')
	const res = await fetch(props.lyricsSrc)
	const buffer = await res.arrayBuffer()
	console.timeEnd('Fetching BSON')

	console.time('Deserializing BSON')
	const result = BSON.deserialize(new Uint8Array(buffer))
	const lyrics = result.lyrics as BSON.Binary[]
	console.timeEnd('Deserializing BSON')

	lyrics.forEach((lyric, i) => bitmaps.set(i, lyric.buffer))
})

const $lyrics = ref<HTMLElement | null>(null)

// Update visibleLyrics
const visibleLyrics: (Lyric & {start: number; visible: boolean})[] = []

const LyricDuration = 4

onMounted(() => {
	if ($lyrics.value === null) return

	for (const id of range(50)) {
		const canvas = document.createElement('canvas')
		canvas.classList.add('lyric')
		$lyrics.value.appendChild(canvas)

		const ctx = canvas.getContext('2d', {willReadFrequently: true})!
		canvas.width = 145
		canvas.height = 229
		const pix = ctx.createImageData(145, 229)
		contexts.set(id, {ctx, pix})

		visibleLyrics.push({
			time: 0,
			duration: 0,
			index: -1,
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

const lastDrawnLyric = new Map<number, {index: number; frame: number}>()

function drawLyric(id: number, index: number, frame: number) {
	const lastDrawn = lastDrawnLyric.get(id)
	if (lastDrawn && lastDrawn.index === index && lastDrawn.frame === frame) {
		return
	}

	const {ctx, pix} = contexts.get(id)!

	if (index < 0) {
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
	} else {
		const bmp = bitmaps.get(index)

		if (bmp) {
			const threshold = thresholds[frame]
			const [r, g, b] = primaryRGB.value

			for (let i = 0; i < bmp.length; i++) {
				pix.data[i * 4 + 3] = bmp[i] >= threshold ? 255 : 0
				pix.data[i * 4] = r
				pix.data[i * 4 + 1] = g
				pix.data[i * 4 + 2] = b
			}

			ctx.putImageData(pix, 0, 0)
		}
	}

	lastDrawnLyric.set(id, {index, frame})
}

function updateLyrics() {
	if ($lyrics.value === null) return

	const now = Date.now() / 1000

	for (let id = 0; id < visibleLyrics.length; id++) {
		const lyric = visibleLyrics[id]

		const canvas = contexts.get(id)!.ctx.canvas

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

			drawLyric(id, lyric.index, frame)
		} else {
			drawLyric(id, -1, -1)
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
