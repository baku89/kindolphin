<script setup lang="ts">
import {
	useElementSize,
	useMagicKeys,
	watchThrottled,
	whenever,
} from '@vueuse/core'
import {scalar, vec2} from 'linearly'
import {clamp} from 'lodash'
import {computed, nextTick, onMounted, ref, watch} from 'vue'

import {Book, mangaWidth} from '@/book'
import Lyrics from '@/components/Lyrics.vue'
import Manga from '@/components/Manga.vue'
import Slider from '@/components/Slider.vue'
import Timecode from '@/components/Timecode.vue'
import {useAppSettingsStore} from '@/store/appSettings'
import {FPS, Keyframe, lookupTime, lookupValue} from '@/timeline'
import {useAudio} from '@/use/useAudio'
import {useVirtualScroll} from '@/use/useVirtualScroll'
import {waveform} from '@/waveform'

import SoundAlertPopup from './SoundAlertPopup.vue'

const props = defineProps<{
	minimized: boolean
	book: Book
	scrollTrack: Keyframe<number>[]
}>()

defineEmits<{
	'update:minimized': [value: boolean]
}>()

const settings = useAppSettingsStore()

const volume = computed(() => (settings.muted ? 0 : 1))

// This is necessary to play audio on iOS
watch(
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
const {scroll, cancelInertia, scrollTo} = useVirtualScroll($scrollable, {
	targetSpeed: computed(() => (playing.value ? 100 : 0)),
	onWheel(e) {
		showNav.value = e.deltaY < 0
		playing.value = false
	},

	mapScroll(y) {
		return scalar.clamp(y, 0, maxScroll.value)
	},
	onSwipe(e) {
		showNav.value = e.movement[1] > 0
	},
	onPointerup(e) {
		if (vec2.len(e.offset) < 5) {
			if (props.minimized) {
				showNav.value = true
			} else {
				showNav.value = !showNav.value
			}
		}
	},
})

const mangaScale = computed(() => viewWidth.value / mangaWidth)
const mangaTotalHeight = computed(() => {
	return props.book.pages.reduce((acc, page) => acc + page.height, 0)
})
const maxScroll = computed(
	() => mangaTotalHeight.value * mangaScale.value - viewHeight.value
)

// 漫画座標系におけるシークバーの位置
const seekbarPosition = computed(() => {
	const offsetY = viewHeight.value * 0.8
	return Math.min(offsetY / mangaScale.value, 630)
})

const audioDuration = 164.4930612244898

// オーディオファイルを基準とした時間
const currentTime = computed({
	get() {
		const mangaY = scroll.value / mangaScale.value + seekbarPosition.value
		return lookupTime(mangaY, props.scrollTrack) / FPS
	},
	set(time) {
		const y =
			lookupValue(time * FPS, props.scrollTrack) * mangaScale.value -
			seekbarPosition.value * mangaScale.value
		scrollTo(y)
	},
})

// Restore scroll position
onMounted(() => {
	if (
		0 < settings.lastPlayedTime &&
		settings.lastPlayedTime < audioDuration - 10
	) {
		currentTime.value = settings.lastPlayedTime
	}

	// Save it
	watchThrottled(
		currentTime,
		time => {
			settings.lastPlayedTime = clamp(time, 0, audioDuration)
		},
		{throttle: 500}
	)
})

// Timeline, Timecode = 上下のスクロール幅を加味した時間基準
const inBlankDuration = computed(() => {
	return -lookupTime(seekbarPosition.value, props.scrollTrack) / FPS
})
const outBlankDuration = computed(() => {
	const mangaY = maxScroll.value / mangaScale.value + seekbarPosition.value
	return lookupTime(mangaY, props.scrollTrack) / FPS - audioDuration
})

const timelineDuration = computed(() => {
	return audioDuration + inBlankDuration.value + outBlankDuration.value
})

const currentTimecode = computed(() => {
	return currentTime.value + inBlankDuration.value
})

//------------------------------------------------------------------------------
// オーディオ再生
const playing = ref(false)

const audio = useAudio('./assets/happening.mp3', {volume})

// Scratch the audio when the manga is not playing
watch(
	currentTime,
	(time, prevTime) => {
		if (!playing.value && time !== prevTime && !props.minimized) {
			audio.scratch(time)
		}
	},
	{flush: 'sync'}
)

// On toggle play
watch(
	() => [playing.value],
	() => {
		// Stop the inertia
		cancelInertia()

		// toggle audio play
		if (playing.value) {
			audio.play(currentTime.value)

			// Start from the beginning if the manga is at the end
			if (scroll.value >= maxScroll.value) {
				scrollTo(0)
				nextTick(() => audio.play(currentTime.value))
			}
		} else {
			audio.stop()
		}

		if (playing.value) {
			showNav.value = false

			const dateAtStart = Date.now() / 1000
			const timeAtStart = currentTime.value

			const updateTime = () => {
				if (!playing.value) return

				const elapsed = Date.now() / 1000 - dateAtStart
				const time = timeAtStart + elapsed

				currentTime.value = time

				requestAnimationFrame(updateTime)
			}

			requestAnimationFrame(updateTime)
		}
	},
	{flush: 'sync'}
)

// Stop when the end of the manga is reached
watch(scroll, scroll => {
	if (scroll >= maxScroll.value) {
		playing.value = false
	}
})

//------------------------------------------------------------------------------
// nav

const showNav = ref(false)

//------------------------------------------------------------------------------
// Events
function onPressManga() {
	cancelInertia()
	playing.value = false
}

function onScrubSlider(timecode: number) {
	cancelInertia()
	playing.value = false
	currentTime.value = timecode - inBlankDuration.value
}

watch(
	() => props.minimized,
	() => {
		if (props.minimized) {
			cancelInertia()
			showNav.value = false
			audio.reset()
		} else {
			showNav.value = true
		}
		playing.value = false
	}
)

//------------------------------------------------------------------------------
// Space to toggle
const {space} = useMagicKeys()
whenever(space, () => {
	playing.value = !playing.value
})

//------------------------------------------------------------------------------
// Sound alert
const showSoundAlert = ref(false)

watch(
	() => props.minimized,
	() => {
		if (!props.minimized && !settings.muted) {
			showSoundAlert.value = true
			setTimeout(() => {
				showSoundAlert.value = false
			}, 2000)
		}
	}
)

//------------------------------------------------------------------------------
// Waveform
const amplitude = computed(() => {
	if (playing.value) {
		const frame = Math.floor(currentTime.value * 50 + 15)
		return waveform[scalar.clamp(frame, 0, waveform.length - 1)]
	} else {
		return 0
	}
})

const playStyles = computed(() => {
	const s = 1 + amplitude.value * 0.4
	return {
		transform: `scale(${s}, ${s})`,
	}
})

const showWobble = computed(() => {
	return playing.value && amplitude.value > 0.1
})
</script>

<template>
	<div class="MangaReader" :class="{minimized}">
		<header class="header" :class="{show: showNav}">
			<div class="left">
				<button class="button" @click.stop="$emit('update:minimized', true)">
					<img class="fa fa-img" src="/assets/icons/house.gif" />
				</button>
			</div>
			<h1 class="title" @click.stop="$emit('update:minimized', true)">
				group_inou / HAPPENING (1)
			</h1>
			<div class="right">
				<button class="button" @click="settings.muted = !settings.muted">
					<div class="fa sound-sprite img" :class="{muted: settings.muted}" />
				</button>
			</div>
		</header>
		<main class="manga-wrapper">
			<div
				class="manga-scrollable"
				ref="$scrollable"
				@pointerdown="onPressManga"
			/>
			<div class="manga-content" ref="$mangaWrapper">
				<Manga class="manga" :pages="book.pages" :scroll="scroll" />
				<Lyrics
					:lyricsSrc="book.lyricSrc"
					:seekbarPosition="seekbarPosition"
					:scroll="scroll"
					:currentTime="currentTime"
					:mangaScale="mangaScale"
					:maxScroll="maxScroll"
				/>
			</div>
		</main>
		<footer class="footer">
			<button
				class="play"
				@click="playing = !playing"
				:style="playStyles"
				@pointerdown.prevent
				@pointerup.prevent
			>
				<i
					class="fa fa-sharp fa-solid"
					:class="playing ? 'fa-circle-pause' : 'fa-circle-play'"
				></i>
				<img
					class="wobble"
					v-show="showWobble"
					src="/assets/play_wobble.webp"
				/>
			</button>
			<Slider
				:modelValue="currentTimecode"
				@update:modelValue="onScrubSlider"
				:duration="timelineDuration"
				:amplitude="amplitude"
			/>
			<Timecode class="timecode" :modelValue="currentTimecode" />
		</footer>
		<Transition>
			<SoundAlertPopup v-if="showSoundAlert" />
		</Transition>
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
	font-size 14rem
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

	.button
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
	position relative
	font-size 33rem
	margin auto 0
	line-height 100%
	aspect-ratio 1
	border-radius 50%

	.fa-play
		text-indent 0.2em

.wobble
	display block
	position absolute
	top -15%
	left -15%
	width 130%
	mix-blend-mode multiply

.timecode
	width 3em
	text-align right
	font-size 16rem
	line-height var(--header-height)
</style>
