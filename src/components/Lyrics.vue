<script setup lang="ts">
import {useRafFn} from '@vueuse/core'
import chroma from 'chroma-js'
import {computed, ref, watch, watchEffect} from 'vue'

import {Lyric} from '@/book'
import {useAppSettingsStore} from '@/store/appSettings'
import {useLyrics} from '@/use/useLyrics'

import Bang from './Bang.vue'

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

const primaryRGB = computed(() => {
	return chroma(settings.currentTheme.primary).rgb()
})

const $bang = ref<InstanceType<typeof Bang> | null>(null)

let images: Map<string, HTMLImageElement> = new Map()
watchEffect(() => {
	images = new Map(
		props.lyrics.map(lyric => {
			const img = new Image()
			img.src = lyric.src
			return [lyric.src, img]
		})
	)
})

const lastDrawnLyric = new WeakMap<
	CanvasRenderingContext2D,
	{src: string; frame: number}
>()

function drawLyric(ctx: CanvasRenderingContext2D, src: string, frame: number) {
	const lastDrawn = lastDrawnLyric.get(ctx)
	if (lastDrawn && lastDrawn.src === src && lastDrawn.frame === frame) {
		return
	}

	const img = images.get(src)!

	const threshold = thresholds[frame]
	const [r, g, b] = primaryRGB.value
	const {width, height} = img

	ctx.canvas.width = width
	ctx.canvas.height = height
	ctx.drawImage(img, 0, 0, width, height)

	const pix = ctx.getImageData(0, 0, width, height)

	for (let i = 0; i < pix.data.length; i += 4) {
		pix.data[i + 3] = pix.data[i] >= threshold ? 255 : 0
		pix.data[i] = r
		pix.data[i + 1] = g
		pix.data[i + 2] = b
	}

	ctx.putImageData(pix, 0, 0)

	lastDrawnLyric.set(ctx, {src, frame})
}
watch(
	() => props.currentTime,
	(time, prevTime) => {
		if (prevTime < time) {
			// Add new lyrics that have just became visible
			const newLyrics = getLyricsBetween(prevTime, time)

			const start = Date.now() / 1000

			visibleLyrics.value.push(...newLyrics.map(l => ({...l, start})))

			for (const lyric of newLyrics) {
				$bang.value!.bangAt(lyric.offset[0] + Math.floor(lyric.size[0] / 2))
			}
		}

		// Remove lyrics that are no longer visible
		visibleLyrics.value = visibleLyrics.value.filter(
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
const contexts: CanvasRenderingContext2D[] = []

function updateLyrics() {
	if ($lyrics.value === null) return

	const now = Date.now() / 1000

	for (let i = 0; i < visibleLyricSprites.value.length; i++) {
		const sprite = visibleLyricSprites.value[i]

		let ctx
		if (i >= contexts.length) {
			const canvas = document.createElement('canvas')
			canvas.classList.add('lyric')
			$lyrics.value.appendChild(canvas)

			ctx = canvas.getContext('2d') ?? undefined
			if (!ctx) {
				throw new Error('Failed to get 2d context')
			}

			contexts.push(ctx)
		} else {
			ctx = contexts[i]
		}

		const {canvas} = ctx

		const elapsed = now - sprite.start
		const frame = Math.min(Math.floor(elapsed * 25), LyricAnimationDuration)

		canvas.style.left = sprite.style.left
		canvas.style.transform = sprite.style.transform
		canvas.style.width = sprite.style.width
		canvas.style.height = sprite.style.height
		canvas.style.visibility = 'visible'

		drawLyric(ctx, sprite.src, frame)
	}

	for (let i = visibleLyricSprites.value.length; i < contexts.length; i++) {
		contexts[i].canvas.style.visibility = 'hidden'
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
