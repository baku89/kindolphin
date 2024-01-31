<script setup lang="ts">
import {
	useElementSize,
	useEventListener,
	useMagicKeys,
	watchOnce,
	whenever,
} from '@vueuse/core'
import {scalar} from 'linearly'
import {computed, ref, watch} from 'vue'

import Manga from '@/components/Manga.vue'
import Slider from '@/components/Slider.vue'
import Timecode from '@/components/Timecode.vue'
import {mangaPages, mangaTotalHeight, mangaWidth} from '@/manga'
import {useAppSettingsStore} from '@/store/appSettings'
import {FPS, lookupTime, lookupValue, scrollTrack} from '@/timeline'
import {useAudio} from '@/use/useAudio'
import {useDrag} from '@/use/useDrag'
import {withTimeDelta} from '@/utils'

const props = defineProps<{
	minimized: boolean
}>()

defineEmits<{
	'update:minimized': [value: boolean]
}>()

const settings = useAppSettingsStore()

const volume = computed(() => (settings.muted || props.minimized ? 0 : 1))

watchOnce(
	() => props.minimized,
	() => {
		audio.preliminaryPlay()
	},
	{flush: 'sync'}
)

const $mangaWrapper = ref<HTMLElement | null>(null)
const scrollY = ref(0)
const {width: viewWidth, height: viewHeight} = useElementSize($mangaWrapper, {
	width: 1,
	height: 1,
})

const $navTop = ref<HTMLElement | null>(null)

const mangaScale = computed(() => viewWidth.value / mangaWidth)
const maxScrollY = computed(
	() => mangaTotalHeight * mangaScale.value - viewHeight.value
)

// 漫画座標系におけるシークバーの位置
const seekbarPosition = computed(() => {
	const offsetY = viewHeight.value * 0.7
	return offsetY / mangaScale.value
})

const seekbarStyle = computed(() => {
	return {
		top: `${seekbarPosition.value}rem`,
	}
})

const audioDuration = 164.4930612244898

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

// オーディオファイルを基準とした時間
const currentTime = computed({
	get() {
		const mangaY = scrollY.value / mangaScale.value + seekbarPosition.value
		return lookupTime(mangaY, scrollTrack) / FPS
	},
	set(time) {
		scrollY.value = scalar.clamp(
			lookupValue(time * FPS, scrollTrack) * mangaScale.value -
				seekbarPosition.value * mangaScale.value,
			0,
			maxScrollY.value
		)
	},
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

function togglePlay() {
	isPlaying.value = !isPlaying.value

	if (!isPlaying.value) {
		audio.stop()
		return
	}

	showNav.value = false

	const dateAtStart = Date.now() / 1000
	const timeAtStart = currentTime.value

	audio.play(timeAtStart)

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
	dragSpeed = 0
	isPlaying.value = false
	audio.stop()
}

function onClickManga() {
	if (props.minimized) {
		showNav.value = true
	} else {
		showNav.value = !showNav.value
	}
}

function onScrubSlider(timecode: number) {
	dragSpeed = 0
	isPlaying.value = false
	currentTime.value = timecode - inBlankDuration.value
}

watch(
	() => props.minimized,
	() => {
		isPlaying.value = false
		audio.stop()
		dragSpeed = 0
		showNav.value = true
	}
)

//------------------------------------------------------------------------------
// Wheel scrolling
useEventListener('wheel', e => {
	if (props.minimized) return

	isPlaying.value = false
	scrollY.value = scalar.clamp(scrollY.value + e.deltaY, 0, maxScrollY.value)

	showNav.value = e.deltaY < 0
})

//------------------------------------------------------------------------------
// Space to toggle
const {space} = useMagicKeys()

whenever(space, togglePlay)

//------------------------------------------------------------------------------
// Inertial dragging
const $scrollable = ref<HTMLElement | null>(null)

let dragSpeed = 0

const [onDrag, resetDrag] = withTimeDelta((timeDelta, deltaY: number) => {
	if (timeDelta !== null) {
		dragSpeed = -deltaY / timeDelta
	}
	scrollY.value = scalar.clamp(scrollY.value - deltaY, 0, maxScrollY.value)

	showNav.value = deltaY > 0
})

const [scrollByInertia, resetInertiaScroll] = withTimeDelta(timeDelta => {
	if (isPlaying.value || dragging.value || Math.abs(dragSpeed) < 1) {
		return
	}
	if (timeDelta !== null) {
		dragSpeed *= 1 / (timeDelta + 1)

		const delta = dragSpeed * timeDelta

		scrollY.value = scalar.clamp(scrollY.value + delta, 0, maxScrollY.value)
	}

	requestAnimationFrame(scrollByInertia)
})

const {dragging} = useDrag($scrollable, {
	disabled: computed(() => props.minimized),
	onDragStart() {
		dragSpeed = 0
		resetDrag()
	},
	onDrag({delta}) {
		onDrag(delta[1])
	},
	onDragEnd() {
		resetInertiaScroll()
		requestAnimationFrame(scrollByInertia)
	},
})
</script>

<template>
	<div class="MangaReader">
		<header class="header" :class="{show: showNav, minimized}" ref="$navTop">
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
				<button @click.stop="settings.show = true">
					<i class="fa fa-sharp fa-solid fa-font" />
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
				<div class="seekbar" :style="seekbarStyle" />
			</div>
		</main>
		<footer class="footer" :class="{show: showNav, minimized}">
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
	background white
	position fixed
	inset 0
	overflow hidden
	display grid
	grid-template-rows min-content 1fr min-content

.header
	height var(--header-height)
	background white
	border-bottom 1rem solid black
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

	&.minimized
		transform translate3d(0, 0, 0)
		opacity 0

.manga-scrollable
	position fixed
	inset 0
	overflow hidden
	z-index 1
	cursor grab


.manga-content
	pointer-events none
	position relative
	height 100%
	width var(--manga-width)
	margin 0 auto

.manga
	width 100%
	height 100%

.seekbar
	position absolute
	left 0
	right 0
	height 2rem
	background var(--color-primary)

.footer
	box-sizing content-box
	height var(--header-height)
	padding var(--nav-margin-vert) var(--nav-margin-horiz) var(--footer-padding-bottom)
	background white
	border-top 1rem solid black
	display flex
	align-items stretch
	gap 16rem
	transform translate3d(0, 100%, 0)

.play
	font-size 33rem
	margin auto 0
	line-height 100%
	aspect-ratio 1
	border-radius 50%

	.fa-play
		text-indent 0.2em

.timecode
	width 2.4em
	text-align right
	font-size 12rem
	line-height var(--header-height)
</style>
