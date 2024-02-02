import {useEventListener} from '@vueuse/core'
import {scalar} from 'linearly'
import {MaybeRef, readonly, Ref, ref} from 'vue'

import {useElementDrag} from './useElementDrag'

interface UseVirtualScrollOptions {
	onWheel: (e: WheelEvent) => void
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
	const scrollY = ref(0)
	let swipeSpeed = 0

	useEventListener(el, 'wheel', onWheel)

	// Scroll by wheel
	function onWheel(e: WheelEvent) {
		swipeSpeed = 0

		scrollY.value = options.mapScroll(scrollY.value + e.deltaY)

		options.onWheel(e)
	}

	// Scroll by swipe
	let lastScrollDate = getNow()

	useElementDrag(el, {
		onPointerdown,
		onDrag,
		onPointerup,
	})

	function onPointerdown() {
		swipeSpeed = 0
		lastScrollDate = getNow()
	}

	function onDrag(e: PointerEvent) {
		scrollY.value = options.mapScroll(scrollY.value - e.movementY)

		const now = getNow()
		const dt = now - lastScrollDate

		if (dt > 0) {
			const currentSwipeSpeed = (swipeSpeed = e.movementY / dt)

			swipeSpeed = currentSwipeSpeed
		}

		lastScrollDate = now
	}

	function onPointerup() {
		lastScrollDate = getNow()
		requestAnimationFrame(scrollByInertia)
	}

	// Inertial scrolling
	function scrollByInertia() {
		if (Math.abs(swipeSpeed) < 1) return

		const now = getNow()
		const dt = now - lastScrollDate

		if (dt > 0) {
			const ratio = 1 - 1 / (dt * 0.5 + 1)
			swipeSpeed = scalar.lerp(swipeSpeed, options.targetSpeed.value, ratio)

			const delta = swipeSpeed * dt
			scrollY.value = options.mapScroll(scrollY.value - delta)
		}

		lastScrollDate = now
		requestAnimationFrame(scrollByInertia)
	}

	function cancelInertia() {
		swipeSpeed = 0
	}

	function scrollTo(y: number) {
		scrollY.value = options.mapScroll(y)
	}

	return {
		scrollY: readonly(scrollY),
		scrollTo,
		cancelInertia,
	}
}
