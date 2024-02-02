<script setup lang="ts">
import {computed, ref, watch} from 'vue'

import {Lyric, useLyrics} from '@/use/useLyrics'

import Bang from './Bang.vue'

const props = defineProps<{
	scroll: number
	currentTime: number
	seekbarPosition: number
}>()

const {getLyricsBetween} = useLyrics()

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
			left: `${lyric.offset[0]}rem`,
			transform: `translate3d(0, calc(${lyric.offset[1]}rem - ${props.scroll}px), 0)`,
			width: `${lyric.size[0]}rem`,
			height: `${lyric.size[1]}rem`,
		}
	})
})

const seekbarStyle = computed(() => {
	return {
		top: `${props.seekbarPosition}rem`,
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
	left -30rem
	right -30rem
	height 60rem
	margin-top -30rem
	mask-image url('/assets/seekbar_diffuse.gif')
	mask-size 60rem 60rem
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
