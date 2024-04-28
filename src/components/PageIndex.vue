<script setup lang="ts">
import {whenever} from '@vueuse/core'
import delay from 'delay'
import {computed, onMounted, ref, shallowReactive} from 'vue'

import {Book, BookHappeningEn, BookHappeningJa} from '@/book'
import {useAppSettingsStore} from '@/store/appSettings'
import {useUIStore} from '@/store/ui'
import {scrollTrack} from '@/timeline'
import {usePreloadBook} from '@/use/usePreloadBook'

import CircleProgress from './CircleProgress.vue'
import FooterButton from './FooterButton.vue'
import MangaReader from './MangaReader.vue'
import PaneHelp from './PaneHelp.vue'
import PaneSettings from './PaneSettings.vue'

const preloadJa = usePreloadBook(BookHappeningJa)
const preloadEn = usePreloadBook(BookHappeningEn)

const audioDuration = 164.4930612244898

const settings = useAppSettingsStore()
const ui = useUIStore()

const shelf = shallowReactive<Record<string, Book>>({
	'happening-ja': BookHappeningJa,
	'happening-en': BookHappeningEn,
})

const currentBookId = ref(
	settings.lang === 'ja' ? 'happening-ja' : 'happening-en'
)

onMounted(() => {
	const [first, second] =
		currentBookId.value === 'happening-ja'
			? [preloadJa, preloadEn]
			: [preloadEn, preloadJa]

	setTimeout(() => {
		first.load()
		whenever(() => first.done, second.load)
	}, 250)
})

const minimized = ref(true)
const popover = ref<null | 'help' | 'theme'>()

function openBook(id: string) {
	const preload = id === 'happening-ja' ? preloadJa : preloadEn
	if (!preload.done) {
		preload.load()
	} else {
		currentBookId.value = id
		minimized.value = false
	}
}

//------------------------------------------------------------------------------
// Aux action: Install PWA, or share, or just jump to the Linkcore

const auxMode = ref<'install' | 'share' | 'listen'>('listen')

const auxIcon = computed(() => {
	if (auxMode.value === 'install') {
		return {
			icon: './assets/icons/install.gif',
			label: ui.label.install,
		}
	} else if (auxMode.value === 'share') {
		return {
			icon: './assets/icons/share.gif',
			label: ui.label.share,
		}
	} else {
		return {
			icon: './assets/icons/listen.gif',
			label: ui.label.listen,
		}
	}
})

if ((window as any).deferredPrompt) {
	auxMode.value = 'install'
} else if ('share' in navigator) {
	auxMode.value = 'share'
}

window.addEventListener('beforeinstallprompt', e => {
	e.preventDefault()
	// eslint-disable-next-line no-console
	console.info('PWA support detected')
	;(window as any).deferredPrompt = e
	auxMode.value = 'install'
})

async function auxAction() {
	try {
		if (auxMode.value === 'install') {
			const deferredPrompt = (window as any).deferredPrompt
			deferredPrompt.prompt()
			const choiceResult = await deferredPrompt.userChoice
			if (choiceResult.outcome === 'accepted') {
				// eslint-disable-next-line no-console
				console.info('User accepted the install prompt')
			} else {
				// eslint-disable-next-line no-console
				console.info('User dismissed the install prompt')
			}
		} else if (auxMode.value === 'share') {
			navigator.share({
				title: 'group_inou / HAPPENING',
				text: 'Interactive GIF Manga in collaboration with AC-bu',
				url: 'https://ac-bu.info/happening/',
			})
		} else if (auxMode.value === 'listen') {
			window.open('https://linkco.re/Mu9VcVt8', '_blank')
		}
	} catch (e) {
		// eslint-disable-next-line no-console
		console.error(e)
	}
}

//------------------------------------------------------------------------------
// Fade in animation
const fadeInStatus = ref<'before' | 'in' | 'out'>('before')

onMounted(async () => {
	await delay(1000)
	fadeInStatus.value = 'in'
	await delay(600 + 50)
	document.getElementById('splash')?.remove()
	await delay(50)
	fadeInStatus.value = 'out'
})
</script>

<template>
	<div
		class="PageIndex"
		:class="{
			invert: settings.currentTheme.invert,
			hidden: fadeInStatus !== 'out',
		}"
	>
		<header class="header">
			<div class="left">
				<button @click="minimized = false">
					<img class="fa" src="/assets/icons/read.gif" />
				</button>
			</div>
			<h1 class="title">Kindolphin</h1>
			<div class="right">
				<button @click="settings.muted = !settings.muted">
					<div class="fa sound-sprite img" :class="{muted: settings.muted}" />
				</button>
			</div>
		</header>
		<main class="main">
			<a
				class="youtube"
				href="https://www.youtube.com/watch?v=JP2728BtJ34"
				target="_blank"
				v-hover
			>
				<i class="fa fa-brands fa-youtube"></i>
				<div>{{ ui.label.viewOnYouTube }}</div>
				<i class="fa fa-solid fa-sort"></i>
			</a>
			<a class="book" @click="openBook('happening-ja')" v-hover>
				<div class="thumb">
					<img class="thumb-content" src="/assets/cover_happening.png" />
					<div
						class="book-loading var(--white)-semitransparent"
						v-if="preloadJa.progress < 1"
					>
						<div class="message">
							{{ Math.round(preloadJa.progress * 100) }}%
						</div>
						<div class="progress">
							<div
								class="bar"
								:style="{width: preloadJa.progress * 100 + '%'}"
							/>
						</div>
					</div>
				</div>
				<div class="info">
					<h2>GIFマンガ <wbr />「HAPPENING」(1)</h2>
					<h3>AC部</h3>
					<div class="read-now">
						{{ preloadJa.progress < 1 ? ui.label.loading : ui.label.readNow }}
					</div>
					<CircleProgress
						class="reading-progress"
						:progress="settings.lastPlayedTime"
						:total="audioDuration"
					/>
				</div>
			</a>
			<a class="book" @click="openBook('happening-en')" v-hover>
				<div class="thumb">
					<img class="thumb-content" src="/assets/cover_happening_en.png" />
					<div
						class="book-loading var(--white)-semitransparent"
						v-if="preloadEn.progress < 1"
					>
						<div class="message">
							{{ Math.round(preloadEn.progress * 100) }}%
						</div>
						<div class="progress">
							<div
								class="bar"
								:style="{width: preloadEn.progress * 100 + '%'}"
							/>
						</div>
					</div>
				</div>
				<div class="info">
					<h2>
						GIF Manga “HAPPENING”&nbsp;<wbr /><span style="font-size: 1em"
							>[English Edition]</span
						>
					</h2>
					<h3>AC-bu</h3>
					<div class="read-now">
						{{ preloadEn.progress < 1 ? ui.label.loading : ui.label.readNow }}
					</div>
					<CircleProgress
						class="reading-progress"
						:progress="settings.lastPlayedTime"
						:total="audioDuration"
					/>
				</div>
			</a>
			<a class="book" href="https://linkco.re/Mu9VcVt8" target="_blank" v-hover>
				<div class="thumb album">
					<img class="thumb-content" src="/assets/cover_happy.webp" />
				</div>
				<div class="info">
					<h2>2nd EP “HAPPY”</h2>
					<h3>group_inou (2024)</h3>
					<ul>
						<li>1&nbsp;&nbsp;ON</li>
						<li>2&nbsp;&nbsp;HAPPY</li>
						<li>3&nbsp;&nbsp;HAPPENING</li>
						<li>4&nbsp;&nbsp;SKETCH</li>
						<li>5&nbsp;&nbsp;FANTASY</li>
						<li>6&nbsp;&nbsp;MESSAGE</li>
					</ul>
				</div>
			</a>
		</main>
		<footer class="footer">
			<FooterButton
				:label="ui.label.theme"
				icon="./assets/icons/palette.gif"
				@click="popover = 'theme'"
			/>
			<FooterButton
				:label="ui.label.lang"
				icon="./assets/icons/lang.gif"
				@click="settings.lang = settings.lang === 'en' ? 'ja' : 'en'"
			/>
			<div class="spacer" />
			<FooterButton
				:label="auxIcon.label"
				:icon="auxIcon.icon"
				@click="auxAction"
			/>
			<FooterButton
				:label="ui.label.help"
				icon="./assets/icons/help.gif"
				@click="popover = 'help'"
			/>
		</footer>
		<MangaReader
			v-if="currentBookId === 'happening-ja' ? preloadJa.done : preloadEn.done"
			class="reader"
			:class="{minimized}"
			:book="shelf[currentBookId]"
			:scrollTrack="scrollTrack"
			@click="minimized = false"
			v-model:minimized="minimized"
		/>
	</div>
	<Transition>
		<div class="PageIndex__fade-in" v-if="fadeInStatus === 'in'" />
	</Transition>
	<PaneHelp :show="popover === 'help'" @close="popover = null" />
	<div class="bg-overlay" />
	<div class="ink-overlay" />
	<PaneSettings :show="popover === 'theme'" @close="popover = null" />
</template>

<style lang="stylus" scoped>
.PageIndex
	position fixed
	inset 0
	background var(--theme-bg)
	overflow hidden
	display grid
	grid-template-rows min-content 1fr min-content

	&.hidden
		opacity 0

.header
	height var(--header-height)
	border-bottom 1rem solid var(--black)
	font-size 12rem
	text-align center
	line-height var(--header-height)
	display grid
	grid-template-columns 1fr auto 1fr
	align-items center
	padding 0 var(--nav-margin-horiz)

	.title
		font-size 24rem

	.left
	.right
		display flex
		gap var(--nav-margin-horiz)

	.right
		flex-direction row-reverse


	button
		display block
		font-size 20rem


.main
	display flex
	flex-direction column
	overflow-y scroll
	-webkit-overflow-scrolling touch

.youtube
	text-align center
	font-size 12rem
	height 35rem
	line-height 30rem
	border-bottom 1rem solid var(--black)
	display flex
	align-items center
	justify-content space-between
	padding 0 var(--nav-margin-horiz)

	i
		font-size 16rem

	&.hover
		background var(--black)
		color var(--white)



.book
	display grid
	grid-template-columns min-content 1fr
	padding 10rem
	gap 10rem
	cursor pointer

	&:not(:first-child)
		margin-top -1rem
		border-top 1rem solid transparent

	&.hover
		background var(--black)
		color var(--white)
		border-top-color var(--black)

	&:not(:last-child)
		border-bottom 1rem dotted var(--black)

	.thumb
		position relative
		width 120rem
		aspect-ratio 3 / 4
		border 1rem solid var(--black)

		.book-loading
			position absolute
			inset 0
			width 100%
			display flex
			flex-direction column
			align-items center
			justify-content center
			gap 5rem

		.message
			background var(--white)
			color var(--black)
			font-size 10rem
			font-family var(--font-small)
			letter-spacing 0.2em

		.thumb-content
			width 100%
			height 100%
			object-fit cover

		.progress
			height 10rem
			width 80%
			background var(--white)
			position relative
			border 1rem solid var(--black)

		.bar
			position absolute
			inset 0
			background var(--black)


		&.album
			aspect-ratio 1


.info
	padding-top 4rem
	font-size 12rem
	line-height 1.3

	.neg
		display block
		text-indent -0.5em

	h2
		font-size 14rem
		margin-bottom 0.2em
		text-wrap balance

	h3
		margin-bottom 0.5em

	ul
	ol
		margin-top 5rem
		display flex
		flex-direction column

.read-now
	letter-spacing 0.1em
	background var(--black)
	font-size 10rem
	padding 0.1em 0.2em
	display inline-block
	border-radius 2rem
	color var(--white)
	margin-bottom 1em
	font-family "HiraKakuProN-W3, 游ゴシック, 'Yu Gothic', 'monaco', monospace" % null
	// font-smoothing antialiased !important
	// -webkit-font-smoothing antialiased !important

	.book.hover &
		background var(--white)
		color var(--black)

.reading-progress
	font-size 8rem

	i
		margin-right 2rem

.reader
	z-index 10
	transform-origin 50% 100%
	transition transform 0.2s steps(8), outline 0.2s steps(4)

	&.minimized
		transform scale(0.2) translate3d(0, -10%, 0)
		outline 5rem solid var(--black)

.footer
	box-sizing content-box
	height var(--header-height)
	padding var(--nav-margin-vert) 0 var(--footer-padding-bottom)
	background var(--white)
	border-top 1rem solid var(--black)
	display grid
	grid-template-columns 1fr 1fr calc(var(--manga-width) * 0.2 + 30rem) 1fr 1fr
	align-items stretch
	justify-content space-between

.PageIndex__fade-in
	position fixed
	inset 0
	z-index 19
	background-size 8px 8px
	background-position 0 0
	background-repeat repeat
	background-image url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAA1JREFUGFdj+P///38ACfsD/QVDRcoAAAAASUVORK5CYII=')
	mix-blend-mode lighten

	html.invert &
		filter invert(100%)
		mix-blend-mode darken

	&.v-enter-active
		animation page-fade 0.6s

	&.v-leave-active
		animation page-fade 0.6s reverse

@keyframes page-fade
	0%
		background-image url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=')
	16.5%
		background-image url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=')

	16.6%
		background-image url('data:image/webp;base64,UklGRmgAAABXRUJQVlA4IFwAAADQAgCdASoQABAAAgA0JaQAEOA/gHIAeoAa4RwPTWUAAP7+n80ZcVfv89/xH+ogrG3/cr8QdPGKv/5uIg46v/icyXDbt5v89/xH+ogrG3/cr8QdPGKv/5uIg4qgAA==')
	33.2%
		background-image url('data:image/webp;base64,UklGRmgAAABXRUJQVlA4IFwAAADQAgCdASoQABAAAgA0JaQAEOA/gHIAeoAa4RwPTWUAAP7+n80ZcVfv89/xH+ogrG3/cr8QdPGKv/5uIg46v/icyXDbt5v89/xH+ogrG3/cr8QdPGKv/5uIg4qgAA==')

	33.3%
		background-image url('data:image/webp;base64,UklGRrYAAABXRUJQVlA4IKoAAAAQBQCdASoQABAAAgA0JaQATgDkAvQCYAfi681XzAvwD8segw/p/qAGbBJKqfTnzyAAAP7+oEb/wzwuD/m2+l9nf/lzxu//Nt9L9jj3L//PWAf0jhuCndBJEStSSJeX/MQQ91tPcXzuqDShGhyFAFAH/igcp/z40c7BMV0eF5Llaa7WsKq5/nrAP6Rw3BTugkiJWpJE2h/9L3iRkdM1jPPNTZK8ZEU5vNsAAA==')
	49.9%
		background-image url('data:image/webp;base64,UklGRrYAAABXRUJQVlA4IKoAAAAQBQCdASoQABAAAgA0JaQATgDkAvQCYAfi681XzAvwD8segw/p/qAGbBJKqfTnzyAAAP7+oEb/wzwuD/m2+l9nf/lzxu//Nt9L9jj3L//PWAf0jhuCndBJEStSSJeX/MQQ91tPcXzuqDShGhyFAFAH/igcp/z40c7BMV0eF5Llaa7WsKq5/nrAP6Rw3BTugkiJWpJE2h/9L3iRkdM1jPPNTZK8ZEU5vNsAAA==')

	50%
		background-image url('data:image/webp;base64,UklGRnIAAABXRUJQVlA4IGYAAABwBACdASoQABAAAgA0JaTuHJ88/8QC/APsA///8A6gH//8wD///wD+AAAtgAD83wZdSvPCjHBRT9Z7kLWcp9rHB4aOvJkFan63NB4aOvJkFan64+FPtApnMsU55CRmcfMMsfPwAAA=')
	66.5%
		background-image url('data:image/webp;base64,UklGRnIAAABXRUJQVlA4IGYAAABwBACdASoQABAAAgA0JaTuHJ88/8QC/APsA///8A6gH//8wD///wD+AAAtgAD83wZdSvPCjHBRT9Z7kLWcp9rHB4aOvJkFan63NB4aOvJkFan64+FPtApnMsU55CRmcfMMsfPwAAA=')

	66.6%
		background-image url('data:image/webp;base64,UklGRoAAAABXRUJQVlA4IHQAAADQBACdASoQABAAAgA0JaQAMwB+AGeA/ACRAvwD+AaoF+AflV04H6AeoAcjt/SAYAD+9VQXCPdR6PB/+0hzhB36PvHgfjBHuo9F69tpDnCDv0bv/lrXvTHcdqeB+MEe6j0G73rkqn+ZqRp/yLI8uEHfn4AAAA==')
	83.2%
		background-image url('data:image/webp;base64,UklGRoAAAABXRUJQVlA4IHQAAADQBACdASoQABAAAgA0JaQAMwB+AGeA/ACRAvwD+AaoF+AflV04H6AeoAcjt/SAYAD+9VQXCPdR6PB/+0hzhB36PvHgfjBHuo9F69tpDnCDv0bv/lrXvTHcdqeB+MEe6j0G73rkqn+ZqRp/yLI8uEHfn4AAAA==')

	83.3%
		background-image url('data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAACwAwCdASoQABAAAgA0JaQAJkAkAD+AaoF+AflVzgHqAHI7f0gGAAD+9WPvX3ET8hJ7r9/6cnvx56KUrUfZ/7Y1sCLLHXcfq/8yLzTAZO/lQAAA')
	99.9%
		background-image url('data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAACwAwCdASoQABAAAgA0JaQAJkAkAD+AaoF+AflVzgHqAHI7f0gGAAD+9WPvX3ET8hJ7r9/6cnvx56KUrUfZ/7Y1sCLLHXcfq/8yLzTAZO/lQAAA')

	100%
		background-image url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAA1JREFUGFdj+P///38ACfsD/QVDRcoAAAAASUVORK5CYII=')
</style>
