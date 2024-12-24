<script setup lang="ts">
import {useEventListener} from '@vueuse/core'
import {clamp} from 'lodash'
import {ref, watch} from 'vue'

import {usePreload} from '../use/usePreload'

const props = defineProps<{
	show: boolean
}>()

const resolution = ref(3)
const buttons = ref<HTMLDivElement | null>(null)
const preload = usePreload()

preload.fetch('./assets/giftoooon_statement_0.webp', 100)
preload.fetch('./assets/giftoooon_statement_1.webp', 100)
preload.fetch('./assets/giftoooon_statement_2.webp', 100)
preload.fetch('./assets/giftoooon_statement_3.webp', 100)

const animatingStatus = ref<'forward' | 'reverse' | null>(null)

let isDragging = false

useEventListener(buttons, 'pointerdown', e => {
	isDragging = true
	onDrag(e)
})

useEventListener(buttons, 'pointerup', () => {
	isDragging = false
})

useEventListener(buttons, 'pointermove', onDrag)

function onDrag(e: PointerEvent) {
	animatingStatus.value = null

	if (!isDragging) return
	const {left, width} = buttons.value!.getBoundingClientRect()
	const x = e.clientX - left
	resolution.value = clamp(Math.floor((x / width) * 4), 0, 3)
}

watch(
	() => [props.show, animatingStatus],
	([show, status], [prevShow, prevStatus]) => {
		if (show && !prevShow) {
			beginAnimation()
		} else if (!show && prevShow) {
			animatingStatus.value = null
		}

		if (status && !prevStatus) {
			beginAnimation()
		} else if (!status && prevStatus) {
			animatingStatus.value = null
		}
	}
)

function beginAnimation() {
	animatingStatus.value = 'forward'

	animate()

	function animate() {
		if (animatingStatus.value === null) return

		if (resolution.value === 0) {
			animatingStatus.value = 'forward'
		} else if (resolution.value === 3) {
			animatingStatus.value = 'reverse'
		}

		resolution.value += animatingStatus.value === 'forward' ? 1 : -1

		setTimeout(animate, 1000)
	}
}
</script>

<template>
	<div class="Statement">
		<div
			class="img"
			:style="{
				backgroundImage: `url('./assets/giftoooon_statement_${resolution}.webp')`,
			}"
		/>

		<div class="buttons" ref="buttons">
			<div class="lowres" />
			<div class="hires" />
			<div class="snap" />
			<div class="snap" />
			<div class="snap" />
			<div class="snap" />

			<div class="knob" :style="{left: `${resolution * 25 + 12.5}%`}" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.Statement
	height 100%
	display grid
	grid-template-rows 1fr min-content

	.img
		background-size contain
		background-position center
		background-repeat no-repeat

	img
		display block
		position absolute
		inset 0
		object-fit contain

.buttons
	display flex
	position relative

	&:before
		content ''
		position absolute
		height 4px
		left 12.5%
		right 12.5%
		top calc(50% - 2px)
		background var(--black)
		border-radius 2px

.snap
	position relative
	z-index 1
	background transparent
	flex-grow 1
	height 40rem

	&:before
		content ''
		position absolute
		width 10px
		height 10px
		background var(--black)
		border-radius 50%
		top 50%
		left 50%
		transform translate(-50%, -50%)

.lowres
.hires
	position absolute
	height 20rem
	width 20rem
	top 10rem
	background-size 100% 100%
	background-position center
	background-repeat no-repeat
	pointer-events none

.lowres
	left 0
	background-image url('/assets/icons/lowres.png')

.hires
	right 0
	background-image url('/assets/icons/hires.png')

.knob
	z-index 2
	position absolute
	width 20rem
	height 20rem
	background var(--white)
	border 2px solid var(--black)
	border-radius 50%
	top 50%
	left 0
	transform translate(-50%, -50%)
	pointer-events none
	transition left 0.1s linear
</style>
