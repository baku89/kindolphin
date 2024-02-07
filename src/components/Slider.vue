<script setup lang="ts">
import {scalar} from 'linearly'
import {computed, ref} from 'vue'

import {DragEvent, useElementDrag} from '@/use/useElementDrag'

const props = defineProps<{
	modelValue: number
	duration: number
}>()

const emit = defineEmits<{
	'update:modelValue': [value: number]
}>()

const knobStyle = computed(() => {
	return {
		left: `${(props.modelValue / props.duration) * 100}%`,
	}
})

const $slider = ref<HTMLElement | null>(null)

const {dragging} = useElementDrag($slider, {
	onPointerdown,
	onDrag,
})

let knobOffset = 0

function onPointerdown(e: DragEvent) {
	const isKnobPressed = e.target.classList.contains('knob')

	if (isKnobPressed) {
		const {left, right} = e.target.getBoundingClientRect()
		const center = (left + right) / 2
		knobOffset = center - e.clientX
	} else {
		knobOffset = 0
	}

	onDrag(e)
}

function onDrag(e: DragEvent) {
	const {left, right} = $slider.value!.getBoundingClientRect()
	const {clientX} = e

	const newValue = scalar.fit(
		clientX + knobOffset,
		left,
		right,
		0,
		props.duration
	)

	emit('update:modelValue', newValue)
}
</script>

<template>
	<div class="Slider" :class="{dragging}" ref="$slider">
		<div class="track" />
		<button class="knob fa fa-regular fa-circle" :style="knobStyle" v-hover />
	</div>
</template>

<style scoped lang="stylus">
.Slider
	position relative
	width 100%
	display flex
	align-items center

.track
	width 100%
	height 2rem
	background var(--black)

.knob
	position absolute
	display block
	top 50%
	font-size calc(0.5 * var(--header-height))
	text-align center
	line-height calc(0.5 * var(--header-height))
	width calc(0.5 * var(--header-height))
	height calc(0.5 * var(--header-height))
	background var(--white)
	border-radius 50%
	transition scale 0.1s steps(3)
	cursor ew-resize
	scale 1
	translate -50% -50%
	will-change left, scale


	&.hover
		scale 1.2

	.dragging &
		scale 1.4
</style>
