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
import {useAudio} from '@/use/useAudio'
import {useDrag} from '@/use/useDrag'
import {withTimeDelta} from '@/utils'

const enableSound = ref<boolean | null>(null)
const volume = computed(() => (enableSound.value ? 1 : 0))

const scrollY = ref(0)

const $mangaWrapper = ref<HTMLElement | null>(null)

const mangaPages = [
	597, 695, 740, 765, 1211, 937, 716, 1246, 527, 1142, 538, 1689, 1211, 1133,
	1783, 1197, 1144, 1123, 1215, 1529, 1162, 1323, 1159, 851, 1422, 1178, 1541,
	1753, 1018, 914,
].map((height, i) => ({
	src: `./assets/manga_${i.toString().padStart(2, '0')}.webp`,
	width: 324,
	height,
}))

const {width: windowWidth} = useElementSize($mangaWrapper)
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

function onTapManga() {
	dragSpeed = 0
	isPlaying.value = false
	audio.stop()
}

function onScrub(time: number) {
	dragSpeed = 0
	isPlaying.value = false
	currentTime.value = time
}

//------------------------------------------------------------------------------
// Wheel scrolling
useEventListener('wheel', e => {
	isPlaying.value = false
	scrollY.value = scalar.clamp(scrollY.value + e.deltaY, 0, 100000)
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
	scrollY.value = scalar.clamp(scrollY.value - deltaY, 0, 100000)
})

const [scrollByInertia, resetInertiaScroll] = withTimeDelta(timeDelta => {
	if (isPlaying.value || dragging.value || Math.abs(dragSpeed) < 1) {
		return
	}
	if (timeDelta !== null) {
		dragSpeed *= 1 / (timeDelta + 1)

		const delta = dragSpeed * timeDelta

		scrollY.value = scalar.clamp(scrollY.value + delta, 0, 100000)
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
		<nav class="nav">
			<a href="./" class="nav-item">
				<i class="fa fa-sharp fa-solid fa-home" />
			</a>
			<a href="./" class="nav-item">
				<i class="fa fa-sharp fa-solid fa-book" />
			</a>
			<a href="./" class="nav-item">
				<i class="fa fa-sharp fa-solid fa-user" />
			</a>
		</nav>
		<SoundAlert v-model="enableSound" v-if="enableSound === null" />
		<div class="scrollable" ref="$scrollable" @pointerdown="onTapManga" />
		<main class="manga-wrapper">
			<div class="manga-content" ref="$mangaWrapper">
				<Manga class="manga" :pages="mangaPages" :scroll="scrollY" />
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
				@update:modelValue="onScrub"
				:duration="duration"
			/>
			<Timecode class="timecode" :modelValue="currentTime" />
		</footer>
	</div>
</template>

<style scoped lang="stylus">
.App
	--nav-height 'min(6vh, 4rem)' % null

.nav
	position fixed
	top 0
	height var(--nav-height)
	background var(--color-bg)
	border-bottom var(--px) solid var(--color-ink)
	z-index 2
	width 100%


.scrollable
	position fixed
	inset 0
	overflow hidden
	// background red
	z-index 1
	cursor grab

.manga-wrapper
	pointer-events none
	position fixed
	inset 0
	overflow hidden

.manga-content
	position relative
	height 100%
	width var(--manga-width)
	margin 0 auto

.manga
	width 100%
	height 100%

.footer
	box-sizing content-box
	--padding-bottom calc(1rem + env(safe-area-inset-bottom))
	position fixed
	left 0
	right 0
	bottom 0
	height var(--nav-height)
	padding 1rem 1rem var(--padding-bottom)
	background var(--color-bg)
	border-top var(--px) solid var(--color-ink)
	display flex
	align-items stretch
	gap 3rem
	z-index 2

.play
	font-size 2vh
	height 100%
	line-height 100%
	background var(--color-ink)
	color white
	aspect-ratio 1
	border-radius 50%

	.fa-play
		text-indent 0.2em

.timecode
	width 2.5em
	text-align right
	font-size 3vh
	line-height var(--nav-height)
</style>
