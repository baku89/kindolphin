<script setup lang="ts">
import {useEventListener, useWindowScroll, useWindowSize} from '@vueuse/core'
import {computed, ref, watch} from 'vue'

import Slider from '@/components/Slider.vue'
import Timecode from '@/components/Timecode.vue'
import {useAudio} from '@/use/useAudio'

const $manga = ref<HTMLElement | null>(null)

const pageHeights = [
	597, 695, 740, 765, 121, 937, 716, 124, 527, 114, 538, 168, 121, 113, 178,
	119, 114, 112, 121, 152, 116, 132, 115, 851, 142, 117, 154, 175, 101, 914,
]

const {width: windowWidth} = useWindowSize()
const {y: scrollY} = useWindowScroll()
const heightPerSecond = computed(() => (690 / 1080) * windowWidth.value)
const currentTime = computed({
	get: () => scrollY.value / heightPerSecond.value,
	set(time) {
		window.scrollTo(0, time * heightPerSecond.value)
	},
})

const audio = useAudio('./assets/happening.mp3')
watch(
	currentTime,
	time => {
		if (!isPlaying.value) {
			audio.scratch(time)
		}
	},
	{flush: 'sync'}
)

useEventListener($manga, 'pointerdown', () => (isPlaying.value = false))

const isPlaying = ref(false)

function togglePlay() {
	isPlaying.value = !isPlaying.value
	if (!isPlaying.value) return

	const dateAtStart = Date.now() / 1000
	const timeAtStart = currentTime.value

	audio.play(timeAtStart)

	updateTime()

	function updateTime() {
		if (!isPlaying.value) return

		const elapsed = Date.now() / 1000 - dateAtStart
		const time = timeAtStart + elapsed

		if (Math.abs(time - currentTime.value) > 0.03) {
			isPlaying.value = false
			return
		}
		currentTime.value = time

		requestAnimationFrame(updateTime)
	}
}

function onScrub(time: number) {
	isPlaying.value = false

	currentTime.value = time
}
</script>

<template>
	<div class="manga" ref="$manga">
		<img
			class="manga-page"
			v-for="(height, i) in pageHeights"
			:key="i"
			:src="`./assets/manga_${i.toString().padStart(2, '0')}.gif`"
			:width="324"
			:height="height"
		/>
	</div>
	<nav class="nav">
		<button class="play" @click="togglePlay">
			<i
				class="fa-sharp fa-solid"
				:class="isPlaying ? 'fa-pause' : 'fa-play'"
			></i>
		</button>
		<Slider
			:modelValue="currentTime"
			@update:modelValue="onScrub"
			:duration="163.392"
		/>
		<Timecode class="timecode" :modelValue="currentTime" />
	</nav>
</template>

<style scoped lang="stylus">
.manga
	pointer-event none

.manga-page
	width 100%
	height auto
	image-rendering pixelated

.nav
	--padding-bottom calc(1vh + env(safe-area-inset-bottom))
	position fixed
	bottom 0
	height calc(9vh + var(--padding-botom))
	padding 1vh 2vw var(--padding-bottom)
	background var(--color-bg)
	width 100%
	border-top var(--px) solid black
	display flex
	align-items center
	gap 2vw

.play
	font-size 2vh
	height 6vh
	line-height 100%
	background black
	color white
	aspect-ratio 1
	margin 0.5rem
	border-radius 50%

	.fa-play
		text-indent 0.2em

.timecode
	width 4ch
	text-align right
	font-size 3vh
	line-height 8vh
</style>
