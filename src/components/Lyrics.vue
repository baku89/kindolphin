<script setup lang="ts">
import {useRafFn} from '@vueuse/core'
import {computed, ref, watch} from 'vue'

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

const LyricAnimationDuration = 5
const settings = useAppSettingsStore()

const $bang = ref<InstanceType<typeof Bang> | null>(null)

const images = computed(() => {
	return new Map<string, HTMLImageElement>(
		props.lyrics.map(lyric => {
			const img = new Image()
			img.src = lyric.src
			return [lyric.src, img] as const
		})
	)
})

const ctx = document.createElement('canvas').getContext('2d')!

ctx.canvas.width = 145
ctx.canvas.height = 229

const spriteCache = new Map<string, Map<number, string>>()
function getURLOfSprite(src: string, frame: number) {
	if (!spriteCache.has(src)) {
		spriteCache.set(src, new Map())
	}

	if (!spriteCache.get(src)!.has(frame)) {
		const img = images.value.get(src)!

		const b = [0.6, 1.2, 1, 0.85, 0.6, 0.51][frame]

		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

		ctx.filter = `brightness(${b}) contrast(100)`
		ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height)

		ctx.filter = 'none'
		ctx.fillStyle = settings.currentTheme.primary
		ctx.globalCompositeOperation = 'multiply'
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

		const url = ctx.canvas.toDataURL()
		spriteCache.get(src)!.set(frame, url)
	}

	return spriteCache.get(src)!.get(frame)
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
		const elapsed = now.value - lyric.start
		const frame = Math.min(Math.floor(elapsed * 25), LyricAnimationDuration)
		const src = getURLOfSprite(lyric.src, frame)

		return {
			src,
			style: {
				left: `calc(${lyric.offset[0]} * var(--px))`,
				transform: `translate3d(0, calc(${lyric.offset[1]} * var(--px) - ${props.scroll}px), 0)`,
				width: `calc(${lyric.size[0]} * var(--px))`,
				height: `calc(${lyric.size[1]} * var(--px))`,
			},
		}
	})
})

const seekbarStyle = computed(() => {
	return {
		top: `calc(${props.seekbarPosition} * var(--px))`,
	}
})

const now = ref(Date.now() / 1000)
useRafFn(() => {
	now.value = Date.now() / 1000
})
</script>

<template>
	<div class="seekbar" :style="seekbarStyle" />
	<Bang ref="$bang" :style="seekbarStyle" />
	<div class="lyric-wrapper" ref="$lyrics">
		<img
			class="lyric"
			v-for="(sprite, i) in visibleLyricSprites"
			:key="i"
			:src="sprite.src"
			:style="sprite.style"
		/>
	</div>
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

	// body.invert &
	// 	mix-blend-mode darken

.lyric
	position absolute
	display block
	background-color transparent
	mask-type luminance
	// opacity 0.5
	// mix-blend-mode lighten
	top 0
</style>
