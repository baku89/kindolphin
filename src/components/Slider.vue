<script setup lang="ts">
import {scalar} from 'linearly'
import {computed} from 'vue'

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

function onKnobPointed(e: PointerEvent) {
	const knob = e.target as HTMLElement
	const wrapper = knob.parentElement!

	knob.setPointerCapture(e.pointerId)

	knob.addEventListener('pointermove', onPointermove)
	knob.addEventListener('pointerup', onPointerup)
	knob.addEventListener('pointerleave', onPointerup)
	knob.addEventListener('pointercancel', onPointerup)

	function onPointermove(e: PointerEvent) {
		e.preventDefault()
		const {left, right} = wrapper.getBoundingClientRect()
		const {clientX} = e

		const newValue = scalar.fit(clientX, left, right, 0, props.duration)

		emit('update:modelValue', newValue)
	}

	function onPointerup() {
		knob.removeEventListener('pointermove', onPointermove)
		knob.removeEventListener('pointerup', onPointerup)
		knob.removeEventListener('pointerleave', onPointerup)
		knob.removeEventListener('pointercancel', onPointerup)
	}
}
</script>

<template>
	<div class="Slider">
		<div class="track" />
		<div class="knob-wrapper">
			<div
				class="knob"
				:style="knobStyle"
				ref="$knob"
				@pointerdown="onKnobPointed"
			/>
		</div>
	</div>
</template>

<style scoped lang="stylus">
.Slider
	position relative
	width 100%
	display flex
	align-items center
	background gray

.track
	width 100%
	height calc(2 * var(--px))
	background black

.knob-wrapper
	position absolute
	left 2vw
	right 2vw
	height 100%

.knob
	position absolute
	top 50%
	left 0
	width 4vh
	height 4vh
	background white
	border calc(var(--px) * 1) solid black
	border-radius 50%
	transform translate(-50%, -50%)
	transition left 0.1s
</style>
