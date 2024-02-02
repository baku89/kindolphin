<script setup lang="ts">
import {useElementSize, useMagicKeys, watchOnce, whenever} from '@vueuse/core'
import {scalar} from 'linearly'
import {computed, ref, watch} from 'vue'

import Lyrics from '@/components/Lyrics.vue'
import Manga from '@/components/Manga.vue'
import Slider from '@/components/Slider.vue'
import Timecode from '@/components/Timecode.vue'
import {mangaPages, mangaTotalHeight, mangaWidth} from '@/manga'
import {useAppSettingsStore} from '@/store/appSettings'
import {FPS, lookupTime, lookupValue, scrollTrack} from '@/timeline'
import {useAudio} from '@/use/useAudio'
import {useVirtualScroll} from '@/use/useVirtualScroll'

const props = defineProps<{
	minimized: boolean
}>()

defineEmits<{
	'update:minimized': [value: boolean]
}>()

const settings = useAppSettingsStore()

const volume = computed(() => (settings.muted || props.minimized ? 0 : 1))

// This is necessary to play audio on iOS
watchOnce(
	() => props.minimized,
	() => {
		audio.preliminaryPlay()
	},
	{flush: 'sync'}
)

const $mangaWrapper = ref<HTMLElement | null>(null)
const {width: viewWidth, height: viewHeight} = useElementSize($mangaWrapper, {
	width: 1,
	height: 1,
})

const $scrollable = ref<HTMLElement | null>(null)
const {scrollY, cancelInertia, scrollTo} = useVirtualScroll($scrollable, {
	targetSpeed: computed(() => (isPlaying.value ? 100 : 0)),
	onWheel(e) {
		showNav.value = e.deltaY < 0
		isPlaying.value = false
	},
	mapScroll(y) {
		return scalar.clamp(y, 0, maxScrollY.value)
	},
})

const mangaScale = computed(() => viewWidth.value / mangaWidth)
const maxScrollY = computed(
	() => mangaTotalHeight * mangaScale.value - viewHeight.value
)

// 漫画座標系におけるシークバーの位置
const seekbarPosition = computed(() => {
	const offsetY = viewHeight.value * 0.8
	return offsetY / mangaScale.value
})

const audioDuration = 164.4930612244898

// オーディオファイルを基準とした時間
const currentTime = computed({
	get() {
		const mangaY = scrollY.value / mangaScale.value + seekbarPosition.value
		return lookupTime(mangaY, scrollTrack) / FPS
	},
	set(time) {
		const y =
			lookupValue(time * FPS, scrollTrack) * mangaScale.value -
			seekbarPosition.value * mangaScale.value

		scrollTo(y)
	},
})

// Timeline, Timecode = 上下のスクロール幅を加味した時間基準
const inBlankDuration = computed(() => {
	return -lookupTime(seekbarPosition.value, scrollTrack) / FPS
})
const outBlankDuration = computed(() => {
	const mangaY = maxScrollY.value / mangaScale.value + seekbarPosition.value
	return lookupTime(mangaY, scrollTrack) / FPS - audioDuration
})

const timelineDuration = computed(() => {
	return audioDuration + inBlankDuration.value + outBlankDuration.value
})

const currentTimecode = computed(() => {
	return currentTime.value + inBlankDuration.value
})

const isPlaying = ref(false)

const audio = useAudio('./assets/happening.mp3', volume)

watch(
	currentTime,
	time => {
		if (!isPlaying.value) {
			audio.scratch(time)
		}
	},
	{flush: 'sync'}
)

watch(
	isPlaying,
	playing => {
		if (playing) {
			audio.play(currentTime.value)
		} else {
			audio.stop()
		}
	},
	{flush: 'sync'}
)

function togglePlay() {
	isPlaying.value = !isPlaying.value
	cancelInertia()

	if (!isPlaying.value) {
		return
	}

	showNav.value = false

	const dateAtStart = Date.now() / 1000
	const timeAtStart = currentTime.value

	updateTime()

	function updateTime() {
		if (!isPlaying.value) return

		const elapsed = Date.now() / 1000 - dateAtStart
		const time = timeAtStart + elapsed

		currentTime.value = time

		requestAnimationFrame(updateTime)
	}
}

//------------------------------------------------------------------------------
// nav

const showNav = ref(false)

//------------------------------------------------------------------------------
// Events
function onPressManga() {
	cancelInertia()
	isPlaying.value = false
}

function onClickManga() {
	if (props.minimized) {
		showNav.value = true
	} else {
		showNav.value = !showNav.value
	}
}

function onScrubSlider(timecode: number) {
	cancelInertia()
	isPlaying.value = false
	currentTime.value = timecode - inBlankDuration.value
}

watch(
	() => props.minimized,
	() => {
		isPlaying.value = false
		cancelInertia()
		showNav.value = true
	}
)

//------------------------------------------------------------------------------
// Space to toggle
const {space} = useMagicKeys()
whenever(space, togglePlay)
</script>

<template>
	<div class="MangaReader" :class="{minimized}">
		<header class="header" :class="{show: showNav}">
			<div class="left">
				<button @click.stop="$emit('update:minimized', true)">
					<i class="fa fa-sharp fa-solid fa-house" />
				</button>
			</div>
			<h1 class="title" @click.stop="$emit('update:minimized', true)">
				group_inou / HAPPENING (1)
			</h1>
			<div class="right">
				<button @click="settings.muted = !settings.muted">
					<i
						class="fa fa-sharp fa-solid"
						:class="settings.muted ? 'fa-volume-xmark' : 'fa-volume-high'"
					/>
				</button>
			</div>
		</header>
		<main class="manga-wrapper">
			<div
				class="manga-scrollable"
				ref="$scrollable"
				@pointerdown="onPressManga"
				@click="onClickManga"
			/>
			<div class="manga-content" ref="$mangaWrapper">
				<Manga class="manga" :pages="mangaPages" :scroll="scrollY" />
				<Lyrics
					:seekbarPosition="seekbarPosition"
					:scroll="scrollY"
					:currentTime="currentTime"
				/>
			</div>
		</main>
		<footer class="footer">
			<button class="play" @click="togglePlay">
				<i
					class="fa fa-sharp fa-solid"
					:class="isPlaying ? 'fa-circle-pause' : 'fa-circle-play'"
				></i>
			</button>
			<Slider
				:modelValue="currentTimecode"
				@update:modelValue="onScrubSlider"
				:duration="timelineDuration"
			/>
			<Timecode class="timecode" :modelValue="currentTimecode" />
		</footer>
	</div>
</template>

<style scoped lang="stylus">
.MangaReader
	background var(--white)
	position fixed
	top 0
	bottom 0
	left 0
	right 0
	overflow hidden
	display grid
	grid-template-rows min-content 1fr min-content
	width 100%

	&.minimized
		left calc(50vw - var(--manga-width) / 2)
		width var(--manga-width)

.header
	height var(--header-height)
	background var(--white)
	border-bottom 1rem solid var(--black)
	transform translate3d(0, -100%, 0)
	font-size 12rem
	display grid
	grid-template-columns 1fr auto 1fr
	align-items center
	padding 0 var(--nav-margin-horiz)

	.left
	.right
		display flex
		gap var(--nav-margin-horiz)

	.right
		flex-direction row-reverse


	button
		display block
		font-size 20rem

.header
.footer
	z-index 2
	transition transform 0.3s steps(5)

	&.show
		transform translate3d(0, 0, 0)

	.minimized &
		transform translate3d(0, 0, 0)
		opacity 0

.manga-scrollable
	position fixed
	inset 0
	overflow hidden
	z-index 1
	cursor grab

	.minimized &
		display none

.manga-content
	pointer-events none
	position relative
	height 100%
	width var(--manga-width)
	margin 0 auto

.manga
	width 100%
	height 100%



.footer
	box-sizing content-box
	height var(--header-height)
	padding var(--nav-margin-vert) var(--nav-margin-horiz) var(--footer-padding-bottom)
	background var(--white)
	border-top 1rem solid var(--black)
	display flex
	align-items stretch
	gap 16rem

.play
	font-size 33rem
	margin auto 0
	line-height 100%
	aspect-ratio 1
	border-radius 50%

	.fa-play
		text-indent 0.2em

.timecode
	width 3em
	text-align right
	font-size 12rem
	line-height var(--header-height)
</style>
