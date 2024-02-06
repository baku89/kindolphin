<script setup lang="ts">
import {defineAsyncComponent, onMounted, ref} from 'vue'

import {BookHappeningJa} from '@/book'
import {useAppSettingsStore} from '@/store/appSettings'
import {useUIStore} from '@/store/ui'
import {scrollTrack} from '@/timeline'
import {usePreload} from '@/use/usePreload'

import FooterButton from './FooterButton.vue'
import PaneSettings from './PaneSettings.vue'

const preload = usePreload()

const settings = useAppSettingsStore()
const ui = useUIStore()

onMounted(() => {
	setTimeout(() => {
		BookHappeningJa.pages.forEach(page => {
			preload.fetch(page.src, page.height)
		})
	}, 250)
})

const MangaReader = defineAsyncComponent(
	() => import('@/components/MangaReader.vue')
)

const minimized = ref(true)
const showThemeSettings = ref(false)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function openBook(id: string) {
	if (preload.progress < 1 || id === '') return

	minimized.value = false
}
</script>

<template>
	<div class="PageIndex" :class="{invert: settings.currentTheme.invert}">
		<header class="header">
			<div class="left">
				<button @click="openBook('happening-ja')">
					<i class="fa fa-brands fa-readme" />
				</button>
			</div>
			<h1 class="title">Kindolphin</h1>
			<div class="right">
				<button @click="settings.muted = !settings.muted">
					<i
						class="fa fa-sharp fa-solid"
						:class="settings.muted ? 'fa-volume-xmark' : 'fa-volume-high'"
					/>
				</button>
			</div>
		</header>
		<main class="main">
			<a class="youtube" href="https://www.youtube.com/watch?v=JP2728BtJ34">
				<i class="fa fa-brands fa-youtube"></i>
				<div>{{ ui.label.viewOnYouTube }}</div>
				<i class="fa fa-solid fa-sort"></i>
			</a>
			<a class="book" @click="openBook('happening-ja')">
				<div class="thumb">
					<img class="thumb-content" src="/assets/cover_happening.png" />
					<div
						class="book-loading var(--white)-semitransparent"
						v-if="preload.progress < 1"
					>
						<div class="message">{{ Math.round(preload.progress * 100) }}%</div>
						<div class="progress">
							<div class="bar" :style="{width: preload.progress * 100 + '%'}" />
						</div>
					</div>
				</div>
				<div class="info">
					<h2>GIFマンガ <wbr />「HAPPENING」(1)</h2>
					<h3>AC部</h3>
					<div class="read-now">
						{{ preload.progress < 1 ? ui.label.loading : ui.label.readNow }}
					</div>
					<div class="reading-progress">
						<i class="fa fa-sharp fa-solid fa-circle" />
						<i class="fa fa-sharp fa-solid fa-circle" />
						<i class="fa fa-sharp fa-solid fa-circle" />
						<i class="fa fa-sharp fa-solid fa-circle" />
						<i class="fa fa-sharp fa-solid fa-circle" />
						<i class="fa fa-sharp fa-solid fa-circle" />
						<i class="fa fa-sharp fa-regular fa-circle" />
						<i class="fa fa-sharp fa-regular fa-circle" />
						<i class="fa fa-sharp fa-regular fa-circle" />
						<i class="fa fa-sharp fa-regular fa-circle" />
						<i class="fa fa-sharp fa-regular fa-circle" />
						<i class="fa fa-sharp fa-regular fa-circle" />
						<i class="fa fa-sharp fa-regular fa-circle" />
					</div>
				</div>
			</a>
			<a class="book" @click="openBook('happening-en')">
				<div class="thumb">
					<img class="thumb-content" src="/assets/cover_happening_en.png" />
					<div
						class="book-loading var(--white)-semitransparent"
						v-if="preload.progress < 1"
					>
						<div class="message">{{ Math.round(preload.progress * 100) }}%</div>
						<div class="progress">
							<div class="bar" :style="{width: preload.progress * 100 + '%'}" />
						</div>
					</div>
				</div>
				<div class="info">
					<h2>
						GIF Manga “HAPPENING”<wbr /><span style="font-size: 1em"
							>[English Edition]</span
						>
					</h2>
					<h3>AC-bu</h3>
					<div class="read-now">
						{{ preload.progress < 1 ? ui.label.loading : ui.label.readNow }}
					</div>
					<div class="reading-progress">
						<i class="fa fa-sharp fa-solid fa-circle" />
						<i class="fa fa-sharp fa-solid fa-circle" />
						<i class="fa fa-sharp fa-solid fa-circle" />
						<i class="fa fa-sharp fa-solid fa-circle" />
						<i class="fa fa-sharp fa-solid fa-circle" />
						<i class="fa fa-sharp fa-solid fa-circle" />
						<i class="fa fa-sharp fa-regular fa-circle" />
						<i class="fa fa-sharp fa-regular fa-circle" />
						<i class="fa fa-sharp fa-regular fa-circle" />
					</div>
				</div>
			</a>
			<a class="book" href="https://linkco.re/Mu9VcVt8" target="_blank">
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
				icon="palette"
				@click="showThemeSettings = true"
			/>
			<FooterButton
				:label="ui.label.lang"
				icon="language"
				@click="settings.lang = settings.lang === 'en' ? 'ja' : 'en'"
			/>
			<div class="spacer" />
			<FooterButton
				:label="ui.label.listen"
				href="https://linkco.re/Mu9VcVt8"
				target="_blank"
				icon="music"
			/>
			<FooterButton :label="ui.label.help" icon="circle-question" />
		</footer>
		<MangaReader
			v-if="preload.progress == 1"
			class="reader"
			:class="{minimized}"
			:book="BookHappeningJa"
			:scrollTrack="scrollTrack"
			@click="openBook('happening-ja')"
			v-model:minimized="minimized"
		/>
		<div class="bg-overlay"></div>
		<div class="ink-overlay"></div>
		<PaneSettings v-model:show="showThemeSettings" />
	</div>
</template>

<style lang="stylus" scoped>
.PageIndex
	position fixed
	inset 0
	overflow hidden
	display grid
	grid-template-rows min-content 1fr min-content

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

	&:hover
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

	&:hover
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
	font-family var(--font-small)
	HiraKakuProN-W3
	游ゴシック
	'Yu Gothic'
	メイリオ
	Meiryo
	Verdana
	Helvetica
	Arial
	sans-serif
	.book:hover &
		background var(--white)
		color var(--black)

.reading-progress
	font-size 8rem

	i
		margin-right 2rem

.reader
	z-index 10
	transform-origin 50% 98svh
	transition all 0.2s steps(8)

	&.minimized
		transform scale(0.2)
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
</style>
