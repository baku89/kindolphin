<script setup lang="ts">
import {defineAsyncComponent, ref} from 'vue'

import {mangaPages} from '@/manga'
import {usePreload} from '@/use/usePreload'

const preload = usePreload()

mangaPages.forEach(page => {
	preload.fetch(page.src, page.height / 100)
})

// watchEffect(() => {
// 	console.log('progress=', preload.progress)
// })

const MangaReader = defineAsyncComponent(
	() => import('@/components/MangaReader.vue')
)

const minimized = ref(true)
</script>

<template>
	<div class="PageIndex">
		<header class="header">Kindle</header>
		<main class="main">
			<section class="book">
				<img class="thumb" src="/assets/happening_thumb.gif" />
				<div class="info">
					<h2>GIFマンガ <br /><span class="neg">「HAPPENING」(1)</span></h2>
					<h3>AC部</h3>
					<div class="badge">今すぐ読む</div>
				</div>
			</section>
			<section class="book">
				<img class="thumb album" src="/assets/happy.gif" />
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
			</section>

			<Suspense>
				<template #default>
					<MangaReader
						class="reader"
						:class="{minimized}"
						v-if="preload.progress === 1"
						@click="minimized = false"
						v-model:minimized="minimized"
					/>
				</template>
				<template #fallback>
					<div class="reader">Loading...</div>
				</template>
			</Suspense>
		</main>
		<footer class="footer" />
	</div>
</template>

<style lang="stylus" scoped>
.PageIndex
	position fixed
	inset 0
	overflow hidden
	display grid
	grid-template-rows min-content 1fr min-content

.loading
	position relative
	width var(--manga-width)
	margin 0 auto
	font-size 30rem
	text-align center

.header
	height var(--header-height)
	border-bottom 1rem solid var(--color-ink)

	font-size 30rem
	text-align center
	line-height var(--header-height)

.main
	display flex
	flex-direction column

.book
	display grid
	grid-template-columns min-content 1fr
	border-bottom 1rem dotted var(--color-ink)
	padding 10rem
	gap 10rem

	.thumb
		width 120rem
		aspect-ratio 3 / 4
		border 1rem solid var(--color-ink)

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
		font-size 15rem
		margin-bottom 0.5em

	ul
	ol
		margin-top 5rem
		display flex
		flex-direction column


.reader
	position fixed
	inset 0
	overflow hidden
	z-index 10
	transform-origin 50% 98svh
	transition transform 0.2s steps(4), outline 0.2s steps(4)


	&.minimized
		transform scale(0.2)
		outline 5rem solid var(--color-ink)




.footer
	box-sizing content-box
	height var(--header-height)
	padding var(--nav-margin-vert) var(--nav-margin-horiz) var(--footer-padding-bottom)
	background var(--color-bg)
	border-top 1rem solid var(--color-ink)
	display flex
	align-items stretch
	gap 16rem
</style>
