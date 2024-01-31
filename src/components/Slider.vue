<script setup lang="ts">
import {scalar} from 'linearly'
import {computed, ref} from 'vue'

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

const dragging = ref(false)

function onKnobPointed(e: PointerEvent) {
	const knob = e.currentTarget as HTMLElement

	dragging.value = true

	onPointermove(e)

	knob.setPointerCapture(e.pointerId)

	knob.addEventListener('pointermove', onPointermove)
	knob.addEventListener('pointerup', onPointerup)
	knob.addEventListener('pointerleave', onPointerup)
	knob.addEventListener('pointercancel', onPointerup)

	function onPointermove(e: PointerEvent) {
		e.preventDefault()
		const {left, right} = knob.getBoundingClientRect()
		const {clientX} = e

		const newValue = scalar.fit(clientX, left, right, 0, props.duration)

		emit('update:modelValue', newValue)
	}

	function onPointerup() {
		dragging.value = false

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
		<div class="knob-wrapper" :class="{dragging}" @pointerdown="onKnobPointed">
			<div class="knob" :style="knobStyle" />
		</div>
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
	height calc(2 * var(--px))
	background var(--color-ink)

.knob-wrapper
	position absolute
	left 2vw
	right 2vw
	height 100%

	&.dragging .knob
		width var(--nav-height)
		height var(--nav-height)

.knob
	position absolute
	top 50%
	width calc(0.7 * var(--nav-height))
	height calc(0.7 * var(--nav-height))
	background var(--color-bg)
	border calc(var(--px) * 1) solid var(--color-ink)
	border-radius 50%
	transform translate(-50%, -50%)
	transition width 0.1s steps(3), height 0.1s steps(3)
	cursor ew-resize
	will-change left
</style>
