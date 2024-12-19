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
}>()

defineEmits<{
	open: []
}>()
</script>

<template>
	<a class="BookColumn" @click="$emit('open')" v-hover>
		<div class="thumb">
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
		</div>
		<div class="info">
			<h2 v-html="book.homeTitle" />
			<div class="read-now">
				{{ loadProgress < 1 ? ui.label.loading : ui.label.readNow }}
			</div>
			<CircleProgress
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
</style>
