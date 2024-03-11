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
				<h2>About group_inou</h2>

				<img src="/assets/artist_photo.gif" />

				<p>
					(一言サラッと、イルカくんによる代弁でもあっこゴリラの時の佐藤さんのコメみたいな感じでも。日本語と英語の物量の差がちょっと面白ければと)
				</p>

				<p>
					group_inou, an electric and hip-hop duo based in Tokyo, known for
					transcending the boundaries of band scene, hip-hop, and club music.
					Over their two-decade-long career, they have released 5 albums and
					three EPs, captivating audiences at major festivals both in Japan and
					internationally.
				</p>

				<p>
					They has also gained recognition for their impressive visuals and
					music videos, realized through artistic partnerships with graphic
					designers, filmmakers, and media artists.
				</p>

				<p>
					To celebrate their EP “HAPPENING,” released after a 7-year hiatus,
					they collaborated with the renowned animation group AC-bu (known for
					works like “<a href="https://www.youtube.com/watch?v=ACEBZ-KmuQo"
						>THERAPY</a
					>,” “<a href="https://www.youtube.com/watch?v=w_os8HqfxHc">HEART</a>,”
					“<a href="https://www.youtube.com/watch?v=ZE2ywCcKkdQ">ORIENTATION</a
					>,” and “<a href="https://www.youtube.com/watch?v=Ty2h9XZB6-o"
						>CATCH</a
					>”) and experimental filmmaker and creative coder
					<a href="https://baku89.com/">Baku Hashimoto</a>
					(known for “<a href="https://www.youtube.com/watch?v=WSFeje8-4Vc"
						>EYE</a
					>”). This collaboration led to the release of this "Kindolphin," a
					multilingual, interactive GIF manga app.
				</p>

				<hr />

				<h2>Credit</h2>

				<dl class="credit">
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
				</dl>

				<p style="text-align: right">
					v{{ env.VITE_NPM_VERSION }} ({{ env.VITE_GIT_COMMIT_HASH }})
				</p>
			</div>

			<div class="buttons">
				<button @click="$emit('close')" v-hover>閉じる (<u>C</u>lose)</button>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.PaneHelp
	position fixed
	inset 0
	margin calc(var(--header-height) + 36rem + 20rem) 20rem calc(var(--footer-height) + 20rem)
	pointer-events none
	display flex
	transform scale3d(0, 0, 0)
	transition transform 0.3s steps(5)

	&.show
		transform scale3d(1, 1, 1)

.window
	max-width var(--manga-width)
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
