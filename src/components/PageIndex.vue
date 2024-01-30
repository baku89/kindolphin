<script setup lang="ts">
import {useEventListener, useWindowSize} from '@vueuse/core'
import {scalar} from 'linearly'
import {computed, ref, watch} from 'vue'

import Manga from '@/components/Manga.vue'
import Slider from '@/components/Slider.vue'
import Timecode from '@/components/Timecode.vue'
import {useAudio} from '@/use/useAudio'

const $manga = ref<HTMLElement | null>(null)

const scrollY = ref(0)
useEventListener('wheel', e => {
	isPlaying.value = false
	scrollY.value = scalar.clamp(scrollY.value + e.deltaY, 0, 100000)
})

const mangaPages = [
	597, 695, 740, 765, 121, 937, 716, 124, 527, 114, 538, 168, 121, 113, 178,
	119, 114, 112, 121, 152, 116, 132, 115, 851, 142, 117, 154, 175, 101, 914,
].map((height, i) => ({
	src: `./assets/manga_${i.toString().padStart(2, '0')}.webp`,
	width: 324,
	height,
}))

const {width: windowWidth} = useWindowSize()
const heightPerSecond = computed(() => (690 / 1080) * windowWidth.value)

const duration = 163.392
const currentTime = computed({
	get() {
		return scrollY.value / heightPerSecond.value
	},
	set(time) {
		scrollY.value = time * heightPerSecond.value
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

const isPlaying = ref(false)

function togglePlay() {
	isPlaying.value = !isPlaying.value

	if (!isPlaying.value) {
		audio.stop()
		return
	}

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
	<Manga
		ref="$manga"
		:pages="mangaPages"
		:scroll="scrollY"
		@pointerdown="isPlaying = false"
	/>
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
			:duration="duration"
		/>
		<Timecode class="timecode" :modelValue="currentTime" />
	</nav>
</template>

<style scoped lang="stylus">
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
	align-items stretch
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
	width 2.5em
	text-align right
	font-size 3vh
	line-height 8vh
</style>
