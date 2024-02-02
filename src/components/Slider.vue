<script setup lang="ts">
import {scalar} from 'linearly'
import {computed, ref, watchEffect} from 'vue'

import {useElementDrag} from '@/use/useElementDrag'

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
	onPointerdown: onKnobMove,
	onDrag: onKnobMove,
})

watchEffect(() => {
	if (dragging.value) {
		$slider.value!.focus()
	}
})

function onKnobMove(e: PointerEvent) {
	const {left, right} = $slider.value!.getBoundingClientRect()
	const {clientX} = e

	const newValue = scalar.fit(clientX, left, right, 0, props.duration)

	emit('update:modelValue', newValue)
}
</script>

<template>
	<div class="Slider" :class="{dragging}" ref="$slider">
		<div class="track" />
		<button class="knob fa fa-regular fa-circle" :style="knobStyle" />
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
	background black

.knob
	position absolute
	display block
	top 50%
	font-size calc(0.5 * var(--header-height))
	text-align center
	line-height calc(0.5 * var(--header-height))
	width calc(0.5 * var(--header-height))
	height calc(0.5 * var(--header-height))
	background white
	border-radius 50%
	transform translate(-50%, -50%)
	transition transform 0.1s steps(3)
	cursor ew-resize
	will-change left, transform

	.dragging &
		transform translate(-50%, -50%) scale(1.4)

	&:hover
		transform translate(-50%, -50%) scale(1.2)
</style>
