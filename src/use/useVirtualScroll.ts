import {MaybeRef, onMounted, readonly, ref, unref} from 'vue'

interface UseVirtualScrollOptions {
	onWheel: (e: WheelEvent) => void
	mapScroll: (y: number) => number
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

	onMounted(() => {
		const $el = unref(el)

		if (!$el) return

		$el.addEventListener('wheel', onWheel)
		$el.addEventListener('pointerdown', onPointerdown)
	})

	function onWheel(e: WheelEvent) {
		swipeSpeed = 0

		scrollY.value = options.mapScroll(scrollY.value + e.deltaY)

		options.onWheel(e)
	}

	let lastScrollDate = getNow()

	function onPointerdown(e: PointerEvent) {
		swipeSpeed = 0
		lastScrollDate = getNow()

		const target = e.target as HTMLElement

		target.setPointerCapture(e.pointerId)

		target.addEventListener('pointermove', onDrag)
		target.addEventListener('pointerup', onPointerup)
		target.addEventListener('pointercancel', onPointerup)
		target.addEventListener('pointerleave', onPointerup)
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

	function scrollByInertia() {
		console.log('scrollByInertia', swipeSpeed, scrollY.value)
		if (Math.abs(swipeSpeed) < 1) return

		const now = getNow()
		const dt = now - lastScrollDate

		if (dt > 0) {
			swipeSpeed *= 1 / (dt * 0.6 + 1)

			const delta = swipeSpeed * dt
			scrollY.value = options.mapScroll(scrollY.value - delta)
		}

		lastScrollDate = now
		requestAnimationFrame(scrollByInertia)
	}

	function onPointerup(e: PointerEvent) {
		const target = e.target as HTMLElement

		lastScrollDate = getNow()

		requestAnimationFrame(scrollByInertia)

		target.removeEventListener('pointermove', onDrag)
		target.removeEventListener('pointerup', onPointerup)
		target.removeEventListener('pointercancel', onPointerup)
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
