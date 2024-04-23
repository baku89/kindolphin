<script setup lang="ts">
import {asyncComputed, useRafFn} from '@vueuse/core'
import {BSON} from 'bson'
import chroma from 'chroma-js'
import {clamp, range} from 'lodash'
import {computed, onMounted, ref, watch} from 'vue'

import {Lyric} from '@/book'
import {useAppSettingsStore} from '@/store/appSettings'
import {fetchGzip} from '@/utils'

import Bang from './Bang.vue'

type BSONLyric = Lyric & {bitmap: BSON.Binary}

const props = defineProps<{
	lyricsSrc: string
	scroll: number
	maxScroll: number
	currentTime: number
	seekbarPosition: number
	mangaScale: number
}>()

const settings = useAppSettingsStore()

const lyrics = asyncComputed<Lyric[]>(async () => {
	const buffer = await fetchGzip(props.lyricsSrc)

	const lyrics = BSON.deserialize(new Uint8Array(buffer)).lyrics as BSONLyric[]

	return lyrics.map(lyric => ({
		...lyric,
		bitmap: lyric.bitmap.buffer,
	}))
}, [])

const thresholds = [0.58, 0.03, 0.09, 0.15, 0.433333, 0.716667, 1].map(i =>
	Math.round(i * 255)
)

const LyricAnimationDuration = thresholds.length - 1

const $bang = ref<InstanceType<typeof Bang> | null>(null)

// Drawing logic
const primaryRGB = computed(() => {
	return chroma(settings.currentTheme.primary).rgb()
})

const contexts = new Map<
	number,
	{ctx: CanvasRenderingContext2D; pix: ImageData}
>()

const $lyrics = ref<HTMLElement | null>(null)

// Update visibleLyrics
const currentLyricsForCanvas: ((Lyric & {start: number}) | null)[] = []

const LyricDuration = 4

onMounted(() => {
	if ($lyrics.value === null) return

	// Create all canvases at first
	for (const id of range(50)) {
		const canvas = document.createElement('canvas')
		canvas.classList.add('lyric')
		$lyrics.value.appendChild(canvas)

		const ctx = canvas.getContext('2d', {willReadFrequently: true})!

		const width = 251
		const height = 251

		canvas.width = width
		canvas.height = height
		const pix = ctx.createImageData(width, height)
		contexts.set(id, {ctx, pix})

		currentLyricsForCanvas.push(null)
	}

	watch(
		() => [props.currentTime, lyrics.value] as const,
		([time, lyrics], [prevTime, prevLyrics]) => {
			if (lyrics !== prevLyrics) {
				currentLyricsForCanvas.fill(null)
			}

			// Delete invisible lyrics
			for (let i = 0; i < currentLyricsForCanvas.length; i++) {
				const lyric = currentLyricsForCanvas[i]
				if (
					lyric &&
					!(time - LyricDuration <= lyric.time && lyric.time <= time)
				) {
					currentLyricsForCanvas[i] = null
				}
			}

			const doAnimate = prevTime < time && time - prevTime < 1 / 10

			// Add new lyrics that have just became visible
			const visibleLyrics = getLyricsBetween(
				lyrics,
				time - LyricAnimationDuration,
				time
			)

			if (props.scroll >= props.maxScroll) {
				visibleLyrics.push(lyrics[lyrics.length - 1])
			}

			const start = doAnimate ? Date.now() / 1000 : -1

			for (const lyric of visibleLyrics) {
				// Skip if the lyric is assigned to a canvas
				if (currentLyricsForCanvas.some(l => lyric?.index === l?.index)) {
					continue
				}

				// Assign the lyric to an empty canvas
				const emptyId = currentLyricsForCanvas.findIndex(
					lyric => lyric === null
				)

				if (emptyId === -1) {
					// eslint-disable-next-line no-console
					console.error('No empty lyric found')
					continue
				}

				currentLyricsForCanvas[emptyId] = {...lyric, start}

				// Bang if the lyric is just added
				const justAdded = prevTime < lyric.time && lyric.time <= time

				if (doAnimate && justAdded) {
					const x = lyric.offset[0] + Math.floor(lyric.size[0] / 2)
					$bang.value!.bangAt(x)
				}
			}

			updateLyrics()
		},
		{flush: 'sync'}
	)
})

watch(
	[primaryRGB, lyrics],
	() => {
		lastDrawnLyric.clear()
		updateLyrics()
	},
	{flush: 'sync'}
)

const seekbarStyle = computed(() => {
	const top = clamp(
		props.seekbarPosition * props.mangaScale,
		630 * props.mangaScale - props.scroll,
		33174 * props.mangaScale - props.scroll
	)

	return {
		top: `${top}px`,
	}
})

const lastDrawnLyric = new Map<number, {index: number; frame: number} | null>()

function drawLyric(
	id: number,
	lyric: Lyric | null,
	frame: number | null = null
): void {
	// Skip if the lyric is already drawn
	const lastDrawn = lastDrawnLyric.get(id)
	if (
		(lyric === null && lastDrawn === null) ||
		(lyric && lastDrawn?.index === lyric.index && lastDrawn?.frame === frame)
	) {
		return
	}

	// Then draw the lyric
	const {ctx, pix} = contexts.get(id)!
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

	if (!lyric || frame === null) {
		lastDrawnLyric.set(id, null)
	} else {
		const {
			bitmap,
			size: [bitmapWidth, bitmapHeight],
		} = lyric
		const threshold = thresholds[frame]
		const [r, g, b] = primaryRGB.value
		const pixWidth = pix.width

		let x: number, y: number, i: number, pi: number

		for (y = 0; y < bitmapHeight; y++) {
			for (x = 0; x < bitmapWidth; x++) {
				pi = y * pixWidth + x
				i = y * bitmapWidth + x
				pix.data[pi * 4 + 3] = bitmap[i] >= threshold ? 255 : 0
				pix.data[pi * 4] = r
				pix.data[pi * 4 + 1] = g
				pix.data[pi * 4 + 2] = b
			}
		}

		ctx.putImageData(pix, 0, 0, 0, 0, bitmapWidth, bitmapHeight)
		lastDrawnLyric.set(id, {index: lyric.index, frame})
	}
}

function updateLyrics() {
	if ($lyrics.value === null) return

	const now = Date.now() / 1000

	for (let id = 0; id < currentLyricsForCanvas.length; id++) {
		const lyric = currentLyricsForCanvas[id]

		const canvas = contexts.get(id)!.ctx.canvas

		canvas.style.visibility = lyric ? 'visible' : 'hidden'

		if (lyric) {
			const elapsed = now - lyric.start
			const frame = Math.min(Math.floor(elapsed * 25), LyricAnimationDuration)

			const left = lyric.offset[0] * props.mangaScale
			const top = lyric.offset[1] * props.mangaScale - props.scroll
			const width = 251 * props.mangaScale
			const height = 251 * props.mangaScale

			canvas.style.left = `${left}px`
			canvas.style.transform = `translate3d(0, ${top}px, 0)`
			canvas.style.width = `${width}px`
			canvas.style.height = `${height}px`

			drawLyric(id, lyric, frame)
		} else {
			drawLyric(id, null)
		}
	}
}

useRafFn(updateLyrics)

function getLyricsBetween(lyrics: Lyric[], inTime: number, outTime: number) {
	return lyrics.filter(
		(lyric, i) =>
			inTime < lyric.time && lyric.time <= outTime && i < lyrics.length - 1
	)
}
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
	-webkit-mask-image url('/assets/seekbar_diffuse.gif')
	mask-image url('/assets/seekbar_diffuse.gif')
	-webkit-mask-size calc(60 * var(--px)) calc(60 * var(--px))
	background-color var(--theme-primary)


.lyric-wrapper
	position relative

:deep(.lyric)
	position absolute
	display block
	top 0
</style>
