<script setup lang="ts">
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

const d =
	'M 0,0.5 C 0.833,1.285 1.666,2.065 2.5,2.621 C 3.333,3.176 4.166,3.499 5,3.5 C 5.833,3.499 6.666,3.176 7.500,2.621 C 8.333,2.065 9.166,1.285 10,0.500 C 10.833,-0.285 11.666,-1.065 12.5,-1.621 C 13.333,-2.176 14.166,-2.499 15.000,-2.5 C 15.833,-2.499 16.666,-2.176 17.5,-1.621 C 18.333,-1.065 19.166,-0.285 20,0.499 C 20.833,1.285 21.666,2.065 22.5,2.621 C 23.333,3.176 24.166,3.499 25,3.5 C 25.833,3.499 26.666,3.176 27.500,2.621 C 28.333,2.065 29.166,1.285 30.000,0.499 C 30.833,-0.285 31.666,-1.065 32.5,-1.621 C 33.333,-2.176 34.166,-2.499 35,-2.5 C 35.833,-2.499 36.666,-2.176 37.5,-1.621 C 38.333,-1.065 39.166,-0.285 40,0.499 C 40.833,1.285 41.666,2.065 42.500,2.621 C 43.333,3.176 44.166,3.499 45,3.5 C 45.833,3.499 46.666,3.176 47.5,2.621 C 48.333,2.065 49.166,1.285 50,0.500 C 50.833,-0.285 51.666,-1.065 52.5,-1.621 C 53.333,-2.176 54.166,-2.499 55.000,-2.5 C 55.833,-2.499 56.666,-2.176 57.500,-1.621 C 58.333,-1.065 59.166,-0.285 60.000,0.500 C 60.833,1.285 61.666,2.065 62.5,2.621 C 63.333,3.176 64.166,3.499 65,3.5 C 65.833,3.499 66.666,3.176 67.5,2.621 C 68.333,2.065 69.166,1.285 70,0.500 C 70.833,-0.285 71.666,-1.065 72.500,-1.621 C 73.333,-2.176 74.166,-2.499 75,-2.5 C 75.833,-2.499 76.666,-2.176 77.5,-1.621 C 78.333,-1.065 79.166,-0.285 80,0.499 C 80.833,1.285 81.666,2.065 82.5,2.621 C 83.333,3.176 84.166,3.499 85.000,3.5 C 85.833,3.499 86.666,3.176 87.5,2.621 C 88.333,2.065 89.166,1.285 90,0.500 C 90.833,-0.285 91.666,-1.065 92.5,-1.621 C 93.333,-2.176 94.166,-2.499 95,-2.5 C 95.833,-2.499 96.666,-2.176 97.500,-1.621 C 98.333,-1.065 99.166,-0.285 100,0.499' //Path.toD(Path.formula(f, Iter.range(0, 1, 0.025)))

const trackTransform = computed(() => {
	return `scale(1 ${Math.max(props.amplitude, 0.0001)})`
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
