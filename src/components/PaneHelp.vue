<script setup lang="ts">
import FadeBg from './FadeBg.vue'

defineProps<{
	show: boolean
}>()

defineEmits<{
	close: []
}>()

const env = (import.meta as any).env
</script>

<template>
	<Transition>
		<FadeBg class="PaneSettings__outside" v-if="show" @click="$emit('close')" />
	</Transition>
	<div class="PaneHelp" :class="{show}">
		<div class="window">
			<div class="content">
				<h2 lang="ja">Kindophinとは？</h2>
				<h2 lang="en">What is Kindolphin?</h2>

				<img src="/about-image.webp" />

				<p lang="ja">
					クリエイティブチームのAC部は、
					ハイテンションかつ濃厚なビジュアル表現と「違和感」を持ち味に、
					MVやCMなど、いろいろな作品を作ってきました。
					<strong>Kindolphin</strong>（Kind–Dolphin =
					やさしいイルカ）は、AC部が編み出し、これまでにさまざまなメディアで連載してきた「GIF漫画」を
					まとめて読めるようにしたアプリです。
				</p>

				<p lang="en">
					AC-bu is a creative team known for its high-energy, densely packed
					visual style and unmistakable sense of oddness, making music videos,
					commercials, and all kinds of other work.
					<strong>Kindolphin</strong> (a portmanteau of “kind” and “dolphin”) is
					an app that brings together AC-bu’s “GIF manga,” a format they
					invented and have been serializing across various media, so they can
					all be read in one place.
				</p>

				<p lang="ja">
					当初はgroup_inouの楽曲『<a
						href="https://www.youtube.com/watch?v=JP2728BtJ34"
						target="_blank"
						rel="noopener"
						>HAPPENING</a
					>』のための、
					「読みながら聴く」インタラクティブ・ミュージックビデオアプリとして公開されました。
					その後、AC部の個展『<a
						href="https://ac-bu.info/giftoooon/"
						target="_blank"
						rel="noopener"
						>GIFTOOOON展</a
					>』にあわせて、過去のGIF漫画作品もまとめて読める専用電子書籍アプリとして大幅にリニューアル。
					デザインアワード（<a
						href="https://tokyotypedirectorsclub.org/award/2025_tdc_06/"
						target="_blank"
						rel="noopener"
						>Tokyo TDC賞</a
					>）やアニメーション映画祭（<a
						href="https://archives.airport-anifes.jp/site2024/film/fes2024-group-inou-happning/"
						target="_blank"
						rel="noopener"
						>新千歳映画祭</a
					>）での受賞など、各所で話題を集めています。
					今後も新旧作品を随時収録予定です！
				</p>

				<p lang="en">
					It began as an interactive music video for “<a
						href="https://www.youtube.com/watch?v=JP2728BtJ34"
						target="_blank"
						rel="noopener"
						>HAPPENING</a
					>,” a track by Japanese indie duo group_inou. As you scroll, the music
					is scratched in sync with the page, creating a “read-and-listen”
					experience where the song moves forward as you read the manga. Later,
					on the occasion of AC-bu’s solo exhibition “<a
						href="https://ac-bu.info/giftoooon/"
						target="_blank"
						rel="noopener"
						>GIFTOOOON</a
					>,” it was renewed as an app where past GIF manga works could also be
					collected and read. It has been drawing attention at design awards
					(such as the
					<a
						href="https://tokyotypedirectorsclub.org/award/2025_tdc_06/"
						target="_blank"
						rel="noopener"
						>Tokyo TDC Awards</a
					>) and animation festivals (such as the
					<a
						href="https://archives.airport-anifes.jp/site2024/film/fes2024-group-inou-happning/"
						target="_blank"
						rel="noopener"
						>New Chitose Airport International Animation Festival</a
					>). New and past works will continue to be added over time!
				</p>

				<hr />

				<dl class="credit">
					<div class="line">
						<dt>Video</dt>
						<div class="spacer">.........................................</div>
						<dd><a href="https://www.ac-bu.info/" target="_blank">AC-bu</a></dd>
					</div>

					<div class="line">
						<dt>Interactive Design</dt>
						<div class="spacer">.........................................</div>
						<dd>
							<a href="https://baku89.com" target="_blank">Baku Hashimoto</a>
						</dd>
					</div>
					<div class="line">
						<dt>Music</dt>
						<div class="spacer">.........................................</div>
						<dd>
							<a href="https://twitter.com/gal_official" target="_blank">
								group_inou
							</a>
						</dd>
					</div>
					<div class="line">
						<dt>Audio Engineering</dt>
						<div class="spacer">.........................................</div>
						<dd>
							<a href="https://www.escentier.com/" target="_blank">
								Yogo Yuichi
							</a>
						</dd>
					</div>
				</dl>

				<p style="text-align: right">
					v{{ env.VITE_NPM_VERSION }} ({{ env.VITE_GIT_COMMIT_HASH }})
				</p>
			</div>

			<div class="buttons">
				<button @click="$emit('close')" v-hover>
					<span lang="ja">閉じる (<u>C</u>lose)</span>
					<span lang="en"><u>C</u>lose</span>
				</button>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.PaneHelp
	position fixed
	inset 0
	margin calc(var(--header-height) + 20rem) 20rem calc(var(--footer-height) + 20rem)
	pointer-events none
	display flex
	transform scale3d(0, 0, 0)
	transition transform 0.3s steps(5)

	&.show
		transform scale3d(1, 1, 1)

.window
	width var(--manga-width)
	max-width 50ic
	margin 0 auto
	pointer-events auto
	background var(--white)
	font-size 12rem
	border 1rem solid var(--black)
	border-radius 8rem
	display grid
	grid-template-rows 1fr min-content
	padding var(--nav-margin-horiz) var(--nav-margin-horiz)

	i
		font-size 1.5em
		vertical-align middle
		margin-right 0.5em

.content
	position relative
	padding 0.5em 0 0
	font-weight normal
	overflow-y scroll
	-webkit-overflow-scrolling touch
	padding var(--nav-margin-horiz)


	a:link
		text-decoration underline

	img
		max-width 100%
		margin 0 auto
		display block
		filter none !important

	hr
		border 0
		height 1rem

		margin 1.5em 0


	p
		margin 1em 0
		line-height 1.5em
		text-align justify
		hyphens auto

	h2
		font-weight bold
		margin-bottom 1em
		font-size 18rem
		text-align center

	.credit
		max-width 20em
		margin-left auto
		margin-right auto
		display flex
		flex-direction column
		gap 0.5em

		.line
			display flex

		.spacer
			flex-grow 1
			margin 0 0.5em
			text-overflow ''
			text-align center
			line-height 0.5em
			letter-spacing 0.2em
			overflow hidden

	dt
	dd
		text-wrap nowrap
		white-space nowrap

		dd
			text-align right




.buttons
	position relative
	font-size 0.8em
	color var(--black)
	padding 0 0.3em 0.3em
	display flex
	justify-content center

	button
		padding 0.2em 1em
		box-sizing content-box
		height 3em
		line-height 3em
		background var(--white)
		color var(--black)
		border 1rem solid var(--black)

		&.hover
			color var(--white)
			background var(--black)
</style>
