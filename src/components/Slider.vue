<script setup lang="ts">
import {Iter, Path} from '@baku89/pave'
import {scalar, vec2} from 'linearly'
import {computed, ref} from 'vue'

import {DragEvent, useElementDrag} from '@/use/useElementDrag'

const props = defineProps<{
	modelValue: number
	duration: number
	amplitude: number
}>()

const emit = defineEmits<{
	'update:modelValue': [value: number]
}>()

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
		knobOffset = center - e.client[0]
	} else {
		knobOffset = 0
	}

	onDrag(e)
}

function onDrag(e: DragEvent) {
	const {left, right} = $slider.value!.getBoundingClientRect()
	const {
		client: [clientX],
	} = e

	const newValue = scalar.fit(
		clientX + knobOffset,
		left,
		right,
		0,
		props.duration
	)

	emit('update:modelValue', newValue)
}

const f = (t: number): vec2 => [
	t * 100,
	Math.sin(t * Math.PI * 2 * 5) * 3 + 0.5,
]

const d = Path.toD(Path.formula(f, Iter.range(0, 1, 0.025)))

const trackTransform = computed(() => {
	return `scale(1 ${props.amplitude})`
})

const knobStyle = computed(() => {
	const topOffset =
		f(props.modelValue / props.duration)[1] * 1.5 * props.amplitude

	return {
		left: `${(props.modelValue / props.duration) * 100}%`,
		top: `calc(50% + ${topOffset}rem)`,
	}
})
</script>

<template>
	<div class="Slider" :class="{dragging}" ref="$slider">
		<svg
			class="track"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 100 1"
			preserveAspectRatio="none"
		>
			<path class="stroke" :d="d" :transform="trackTransform" />
		</svg>
		<div class="knob-wrapper" :style="knobStyle">
			<button class="knob fa fa-regular fa-circle" v-hover />
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
	height 2rem
	overflow visible

.stroke
	stroke var(--black)
	stroke-width 5
	fill none
	vector-effect non-scaling-stroke
	shape-rendering crispEdges

.knob-wrapper
	position absolute
	top 50%

.knob
	position absolute
	display block
	top 0
	left 0
	font-size calc(0.5 * var(--header-height))
	text-align center
	line-height calc(0.5 * var(--header-height))
	width calc(0.5 * var(--header-height))
	height calc(0.5 * var(--header-height))
	background var(--white)
	border-radius 50%
	transition transform 0.1s steps(3)
	cursor ew-resize
	transform translate3d(-50%, -50%, 0)
	will-change transform


	&.hover
		transform translate3d(-50%, -50%, 0) scale(1.2)

	.dragging &
		transform translate3d(-50%, -50%, 0) scale(1.4)
</style>
