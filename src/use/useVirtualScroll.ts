import {useEventListener} from '@vueuse/core'
import {scalar} from 'linearly'
import {MaybeRef, readonly, Ref, ref} from 'vue'

import {withTimeDelta} from '@/utils'

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
	let inertiaSpeed = 0

	useEventListener(el, 'wheel', onWheel)

	// Scroll by wheel
	function onWheel(e: WheelEvent) {
		swipeSpeed = inertiaSpeed = 0

		scrollY.value = options.mapScroll(scrollY.value + e.deltaY)

		options.onWheel(e)
	}

	// Scroll by swipe
	let lastScrollDate = getNow()

	const {dragging} = useElementDrag(el, {
		onPointerdown,
		onDrag,
		onPointerup() {
			swipeSpeed = 0
		},
	})

	function onPointerdown() {
		lastScrollDate = getNow()
	}

	function onDrag(e: PointerEvent) {
		scrollY.value = options.mapScroll(scrollY.value - e.movementY)

		const now = getNow()
		const dt = now - lastScrollDate

		if (dt > 0) {
			swipeSpeed = e.movementY / dt
		}

		lastScrollDate = now
	}

	// Inertial scrolling
	const [scrollByInertia] = withTimeDelta(dt => {
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
			scrollY.value = options.mapScroll(scrollY.value - delta)
		}

		requestAnimationFrame(scrollByInertia)
	})

	requestAnimationFrame(scrollByInertia)

	function cancelInertia() {
		swipeSpeed = inertiaSpeed = 0
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
