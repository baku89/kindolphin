import {useEventListener, useRafFn} from '@vueuse/core'
import {scalar} from 'linearly'
import {debounce} from 'lodash'
import {MaybeRef, readonly, Ref, ref} from 'vue'

import {DragEvent, useElementDrag} from './useElementDrag'

// 慣性スクロールを無効化するまでの指を動かさないでいる時間 (sec)
const InertiaCancelDuration = 0.25

// 慣性スクロールが効き始める最低速度 (px/sec)
const MinInertiaScrollSpeed = 140

interface UseVirtualScrollOptions {
	onWheel: (e: WheelEvent) => void
	onSwipe: (e: DragEvent) => void
	mapScroll: (y: number) => number
	targetSpeed: Ref<number>
}

function getNow() {
	return Date.now() / 1000
}

export function useVirtualScroll(
	el: MaybeRef<HTMLElement | null>,
	options: UseVirtualScrollOptions
) {
	const scroll = ref(0)
	let swipeSpeed = 0
	let inertiaSpeed = 0

	useEventListener(el, 'wheel', onWheel)

	// Scroll by wheel
	function onWheel(e: WheelEvent) {
		swipeSpeed = inertiaSpeed = 0

		scroll.value = options.mapScroll(scroll.value + e.deltaY)

		options.onWheel(e)
	}

	// Scroll by swipe
	let lastScrollDate = getNow()

	const {dragging} = useElementDrag(el, {
		onPointerdown,
		onDrag,
		onPointerup,
	})

	function onPointerdown() {
		lastScrollDate = getNow()
	}

	function onDrag(e: DragEvent) {
		scroll.value = options.mapScroll(scroll.value - e.movementY)

		const now = getNow()
		const dt = now - lastScrollDate

		if (dt > 0) {
			swipeSpeed = e.movementY / dt
		}

		lastScrollDate = now

		onLongPress()

		options.onSwipe(e)
	}

	const onLongPress = debounce(
		() => {
			if (!dragging.value) return

			inertiaSpeed = swipeSpeed = 0
		},
		InertiaCancelDuration * 1000,
		{}
	)

	function onPointerup() {
		if (Math.abs(inertiaSpeed) < MinInertiaScrollSpeed) {
			inertiaSpeed = swipeSpeed = 0
		}

		swipeSpeed = 0
	}

	// Inertial scrolling
	useRafFn(({delta}) => {
		const dt = delta / 1000

		// Lerp inertia speed to swipe speed
		if (dt > 0) {
			const directionChanged = swipeSpeed * inertiaSpeed < 0
			const swipeSpeedExceeded = Math.abs(swipeSpeed) > Math.abs(inertiaSpeed)

			if (directionChanged || swipeSpeedExceeded) {
				inertiaSpeed = swipeSpeed
			} else {
				const lerpHalfLife = dragging.value ? 0.1 : 2
				const lerpRatio = 1 - 1 / (dt / lerpHalfLife + 1)

				inertiaSpeed = scalar.lerp(inertiaSpeed, swipeSpeed, lerpRatio)
			}
		}

		if (!dragging.value && Math.abs(inertiaSpeed) > 1) {
			const delta = inertiaSpeed * dt
			scroll.value = options.mapScroll(scroll.value - delta)
		}
	})

	function cancelInertia() {
		swipeSpeed = inertiaSpeed = 0
	}

	function scrollTo(y: number) {
		scroll.value = options.mapScroll(y)
	}

	return {
		scroll: readonly(scroll),
		scrollTo,
		cancelInertia,
	}
}
