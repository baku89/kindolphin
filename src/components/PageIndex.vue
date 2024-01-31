<script setup lang="ts">
import {
	useElementSize,
	useEventListener,
	useMagicKeys,
	whenever,
} from '@vueuse/core'
import {scalar} from 'linearly'
import {computed, ref, watch} from 'vue'

import Manga from '@/components/Manga.vue'
import Slider from '@/components/Slider.vue'
import SoundAlert from '@/components/SoundAlert.vue'
import Timecode from '@/components/Timecode.vue'
import {FPS, lookupTime, lookupValue, scrollTrack} from '@/timeline'
import {useAudio} from '@/use/useAudio'
import {useDrag} from '@/use/useDrag'
import {withTimeDelta} from '@/utils'

const enableSound = ref<boolean | null>(null)
const volume = computed(() => (enableSound.value ? 1 : 0))

const $mangaWrapper = ref<HTMLElement | null>(null)
const scrollY = ref(0)
const {width: viewWidth, height: viewHeight} = useElementSize($mangaWrapper, {
	width: 1,
	height: 1,
})

const mangaWidth = 324
const mangaHeights = [
	597, 695, 740, 765, 1211, 937, 716, 1246, 527, 1142, 538, 1689, 1211, 1133,
	1783, 1197, 1144, 1123, 1215, 1529, 1162, 1323, 1159, 851, 1422, 1178, 1541,
	1753, 1018, 914,
]
const mangaTotalHeight = mangaHeights.reduce((a, b) => a + b, 0)
const mangaPages = mangaHeights.map((height, i) => ({
	src: `./assets/manga_${i.toString().padStart(2, '0')}.webp`,
	width: mangaWidth,
	height,
}))

const mangaScale = computed(() => viewWidth.value / mangaWidth)
const maxScrollY = computed(
	() => mangaTotalHeight * mangaScale.value - viewHeight.value
)

// 漫画座標系におけるシークバーの位置
const seekbarPosition = computed(() => {
	const offsetY = viewHeight.value * 0.5
	return offsetY / mangaScale.value
})

const seekbarStyle = computed(() => {
	return {
		top: `calc(${seekbarPosition.value} * var(--px))`,
	}
})

const duration = 163.392
const currentTime = computed({
	get() {
		const mangaY = scrollY.value / mangaScale.value + seekbarPosition.value
		return lookupTime(mangaY, scrollTrack) / FPS
	},
	set(time) {
		scrollY.value =
			scalar.clamp(
				lookupValue(time * FPS, scrollTrack) * mangaScale.value,
				0,
				maxScrollY.value
			) -
			seekbarPosition.value * mangaScale.value
	},
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

		if (Math.abs(time - currentTime.value) > 0.03) {
			isPlaying.value = false
			return
		}
		currentTime.value = time

		requestAnimationFrame(updateTime)
	}
}

//------------------------------------------------------------------------------
// nav

const showNav = ref(true)

//------------------------------------------------------------------------------
// Events
function onPressManga() {
	dragSpeed = 0
	isPlaying.value = false
	audio.stop()
}

function onClickManga() {
	showNav.value = true
}

function onScrubSlider(time: number) {
	dragSpeed = 0
	isPlaying.value = false
	currentTime.value = time
}

//------------------------------------------------------------------------------
// Wheel scrolling
useEventListener('wheel', e => {
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
	<div class="App">
		<nav class="nav" :class="{show: showNav}">
			<div class="left">
				<button @click="enableSound = !enableSound">
					<i class="fa fa-sharp fa-solid fa-circle-info" />
				</button>

				<button @click="enableSound = !enableSound">
					<i class="fa fa-sharp fa-solid fa-wand-magic-sparkles" />
				</button>
			</div>
			<h1 class="title">group_inou / HAPPENING (1)</h1>
			<div class="right">
				<button @click="enableSound = !enableSound">
					<i
						class="fa fa-sharp fa-solid"
						:class="enableSound ? 'fa-volume-high' : 'fa-volume-xmark'"
					/>
				</button>
				<button @click="enableSound = !enableSound">
					<i class="fa fa-sharp fa-solid fa-font" />
				</button>
			</div>
		</nav>
		<SoundAlert v-model="enableSound" v-if="enableSound === null" />
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
		<footer class="footer">
			<button class="play" @click="togglePlay">
				<i
					class="fa-sharp fa-solid"
					:class="isPlaying ? 'fa-pause' : 'fa-play'"
				></i>
			</button>
			<Slider
				:modelValue="currentTime"
				@update:modelValue="onScrubSlider"
				:duration="duration"
			/>
			<Timecode class="timecode" :modelValue="currentTime" />
		</footer>
	</div>
</template>

<style scoped lang="stylus">
.App
	position fixed
	inset 0
	--nav-height 40rem
	display grid
	grid-template-rows 1fr min-content

.nav
	position fixed
	top 0
	height var(--nav-height)
	background var(--color-bg)
	border-bottom var(--px) solid var(--color-ink)
	z-index 2
	width 100%
	transform translate3d(0, -100%, 0)
	transition transform 0.15s steps(3)
	font-size 12rem
	display grid
	grid-template-columns 1fr auto 1fr
	align-items center
	padding 0 5rem

	.title
		font-weight bold

	.left
	.right
		display flex
		gap 5rem

	.right
		flex-direction row-reverse


	button
		display block

	&.show
		transform translate3d(0, 0, 0)

.manga-wrapper
	overflow hidden

.manga-scrollable
	position fixed
	inset 0
	overflow hidden
	// background red
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
	height 1rem
	background red

.footer
	box-sizing content-box
	--padding-bottom calc(5rem + env(safe-area-inset-bottom))
	height var(--nav-height)
	padding 5rem 5rem var(--padding-bottom)
	background var(--color-bg)
	border-top 1rem solid var(--color-ink)
	display flex
	align-items stretch
	gap 10rem
	z-index 2

.play
	font-size 10rem
	height 100%
	line-height 100%
	background var(--color-ink)
	color var(--color-bg)
	aspect-ratio 1
	border-radius 50%

	.fa-play
		text-indent 0.2em

.timecode
	width 2.5em
	text-align right
	font-size 13rem
	line-height var(--nav-height)
</style>
