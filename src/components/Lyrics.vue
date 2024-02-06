<script setup lang="ts">
import {computed, ref, watch} from 'vue'

import {Lyric} from '@/book'
import {useLyrics} from '@/use/useLyrics'

import Bang from './Bang.vue'

const props = defineProps<{
	lyrics: Lyric[]
	scroll: number
	currentTime: number
	seekbarPosition: number
}>()

const {getLyricsBetween} = useLyrics(computed(() => props.lyrics))

const $bang = ref<InstanceType<typeof Bang> | null>(null)

watch(
	() => props.currentTime,
	(time, prevTime) => {
		if (time < prevTime) {
			visibleLyrics.value = visibleLyrics.value.filter(
				lyric => lyric.time < time
			)
			return
		}

		const lyrics = getLyricsBetween(prevTime, time)

		visibleLyrics.value.push(...lyrics)

		for (const lyric of lyrics) {
			$bang.value!.bangAt(lyric.offset[0] + Math.floor(lyric.size[0] / 2))
		}
	},
	{flush: 'sync'}
)

const visibleLyrics = ref<Lyric[]>([])

const visibleLyricsStyles = computed(() => {
	return visibleLyrics.value.map(lyric => {
		return {
			left: `calc(${lyric.offset[0]} * var(--px))`,
			transform: `translate3d(0, calc(${lyric.offset[1]} * var(--px) - ${props.scroll}px), 0)`,
			width: `calc(${lyric.size[0]} * var(--px))`,
			height: `calc(${lyric.size[1]} * var(--px))`,
		}
	})
})

const seekbarStyle = computed(() => {
	return {
		top: `calc(${props.seekbarPosition} * var(--px))`,
	}
})
</script>

<template>
	<div class="seekbar" :style="seekbarStyle" />
	<Bang ref="$bang" :style="seekbarStyle" />
	<div class="lyric-wrapper">
		<div
			class="lyric"
			v-for="(lyric, i) in visibleLyricsStyles"
			:key="i"
			:style="lyric"
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
	mix-blend-mode lighten

	body.invert &
		mix-blend-mode darken

.lyric
	background var(--theme-primary)
	position absolute
	top 0
</style>
