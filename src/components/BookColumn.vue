<script setup lang="ts">
import {Book} from '@/book'
import {useUIStore} from '@/store/ui'

import CircleProgress from './CircleProgress.vue'

const ui = useUIStore()

defineProps<{
	book: Book
	loadProgress: number
	readPosition: number
	totalReadPosition: number
	circleCount?: number
	borrowed?: boolean
}>()

defineEmits<{
	open: []
}>()
</script>

<template>
	<a class="BookColumn" @click="$emit('open')" v-hover>
		<div class="thumb" :class="{borrowed}">
			<img class="thumb-content" :src="book.thumbSrc" />
			<div
				class="book-loading var(--white)-semitransparent"
				v-if="loadProgress < 1"
			>
				<div class="message">{{ Math.round(loadProgress * 100) }}%</div>
				<div class="progress">
					<div class="bar" :style="{width: loadProgress * 100 + '%'}" />
				</div>
			</div>
			<svg
				class="borrowed-slash"
				v-if="borrowed"
				viewBox="0 0 10 10"
				preserveAspectRatio="none"
			>
				<path d="M0,0 L10,10" />
				<path d="M10,0 L0,10" />
			</svg>
		</div>
		<div class="info">
			<h2 v-html="book.homeTitle" />
			<div class="read-now-label" v-if="!borrowed">
				{{ loadProgress < 1 ? ui.label.loading : ui.label.readNow }}
			</div>
			<div class="borrowed-label" v-else>
				{{ ui.label.borrowed }}
			</div>
			<CircleProgress
				v-if="!borrowed"
				class="reading-progress"
				:progress="readPosition"
				:total="totalReadPosition"
				:count="circleCount"
			/>
		</div>
	</a>
</template>

<style scoped lang="stylus">
.BookColumn
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

		&.borrowed:before
			content ''
			position absolute
			inset 0
			background-size 8px 8px
			background-position 0 0
			background-repeat repeat
			mix-blend-mode lighten
			background-image url('data:image/webp;base64,UklGRnIAAABXRUJQVlA4IGYAAABwBACdASoQABAAAgA0JaTuHJ88/8QC/APsA///8A6gH//8wD///wD+AAAtgAD83wZdSvPCjHBRT9Z7kLWcp9rHB4aOvJkFan63NB4aOvJkFan64+FPtApnMsU55CRmcfMMsfPwAAA=')

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


		.borrowed-slash
			position absolute
			inset 0
			width 100%
			height 100%

			path
				stroke var(--black)
				stroke-width 2
				vector-effect non-scaling-stroke



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

.read-now-label, .borrowed-label
	letter-spacing 0.1em
	font-size 10rem
	line-height 1.3
	padding 0.1em 0.2em
	display inline-block
	border-radius 2rem
	margin-bottom 1em
	font-family "HiraKakuProN-W3, 游ゴシック, 'Yu Gothic', 'monaco', monospace" % null


.read-now-label
	background var(--black)
	color var(--white)
	// font-smoothing antialiased !important
	// -webkit-font-smoothing antialiased !important
	.BookColumn.hover &
		background var(--white)
		color var(--black)

.borrowed-label
	border 1rem dotted currentColor

	.BookColumn.hover &
		color var(--white)

.reading-progress
	font-size 8rem

	i
		margin-right 2rem
</style>
