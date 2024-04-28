import {useEventListener, useRafFn} from '@vueuse/core'
import {scalar} from 'linearly'
import {debounce} from 'lodash'
import {MaybeRef, readonly, ref} from 'vue'

import {DragEvent, useElementDrag} from './useElementDrag'

// 慣性スクロールを無効化するまでの指を動かさないでいる時間 (sec)
const InertiaCancelDuration = 0.25

// 慣性スクロールが効き始める最低速度 (px/sec)
const MinInertiaScrollSpeed = 140

export interface VirtualScrollEvent {
	offset: number
	delta: number
}

interface UseVirtualScrollOptions {
	onSwipe: (e: VirtualScrollEvent) => void
	onPointerdown: (e: VirtualScrollEvent) => void
	onPointerup: (e: VirtualScrollEvent) => void
	mapScroll: (y: number) => number
}

function getNow() {
	return Date.now() / 1000
}

export function useVirtualScroll(
	el: MaybeRef<HTMLElement | null>,
	options: UseVirtualScrollOptions
) {
	const scroll = ref(0)

	// px / sec
	let swipeSpeed = 0
	let inertiaSpeed = 0

	let easeSpeedOptions: null | {
		get: () => number
		onReach: () => void
	} = null

	useEventListener(el, 'wheel', onWheel)

	// Scroll by wheel
	let wheelScrollOrigin: null | number = null
	function onWheel(e: WheelEvent) {
		swipeSpeed = inertiaSpeed = 0

		scroll.value = options.mapScroll(scroll.value + e.deltaY)

		if (wheelScrollOrigin === null) {
			options.onPointerdown({
				offset: 0,
				delta: 0,
			})

			wheelScrollOrigin = scroll.value
		}

		options.onSwipe({
			offset: scroll.value - wheelScrollOrigin,
			delta: e.deltaY,
		})

		onEndWheel()
	}

	const onEndWheel = debounce(() => {
		if (wheelScrollOrigin === null) return

		options.onPointerup({
			offset: scroll.value - wheelScrollOrigin,
			delta: 0,
		})

		wheelScrollOrigin = null
	}, 100)

	// Scroll by swipe
	let lastScrollDate = getNow()

	const {dragging} = useElementDrag(el, {
		onPointerdown,
		onDrag,
		onPointerup,
	})

	function onPointerdown() {
		lastScrollDate = getNow()

		options.onPointerdown({
			offset: 0,
			delta: 0,
		})
	}

	function onDrag(e: DragEvent) {
		scroll.value = options.mapScroll(scroll.value - e.movement[1])

		const now = getNow()
		const dt = now - lastScrollDate

		if (dt > 0) {
			swipeSpeed = e.movement[1] / dt
		}

		lastScrollDate = now

		onLongPress()

		options.onSwipe({
			offset: e.offset[1],
			delta: -e.movement[1],
		})
	}

	const onLongPress = debounce(
		() => {
			if (!dragging.value) return

			inertiaSpeed = swipeSpeed = 0
		},
		InertiaCancelDuration * 1000,
		{}
	)

	function onPointerup(e: DragEvent) {
		if (Math.abs(inertiaSpeed) < MinInertiaScrollSpeed) {
			inertiaSpeed = swipeSpeed = 0
		}

		swipeSpeed = 0

		options.onPointerup({
			offset: e.offset[1],
			delta: 0,
		})
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

			// Accelate/decelerate to target speed
			if (easeSpeedOptions !== null) {
				const targetSpeed = easeSpeedOptions.get()
				const doAccelate = targetSpeed > inertiaSpeed

				const diff =
					Math.abs(inertiaSpeed - targetSpeed) / Math.abs(targetSpeed)

				const rate = scalar.efit(diff, 0, 10, 1000, 5000)

				inertiaSpeed += (doAccelate ? 1 : -1) * rate * dt

				const reached = doAccelate
					? inertiaSpeed >= targetSpeed
					: inertiaSpeed <= targetSpeed

				if (reached) {
					inertiaSpeed = 0
					easeSpeedOptions.onReach()
					easeSpeedOptions = null
				}
			}
		}

		if (!dragging.value && Math.abs(inertiaSpeed) > 1) {
			const delta = inertiaSpeed * dt
			scroll.value = options.mapScroll(scroll.value - delta)
		}
	})

	function cancelInertia() {
		swipeSpeed = inertiaSpeed = 0
		wheelScrollOrigin = null
		easeSpeedOptions = null
	}

	function scrollTo(y: number) {
		scroll.value = options.mapScroll(y)
	}

	function easeToSpeed(options: typeof easeSpeedOptions) {
		easeSpeedOptions = options
	}

	return {
		scroll: readonly(scroll),
		scrollTo,
		cancelInertia,
		easeToSpeed,
	}
}
