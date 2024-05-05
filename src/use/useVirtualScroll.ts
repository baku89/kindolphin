import {useEventListener, useRafFn} from '@vueuse/core'
import {scalar} from 'linearly'
import {debounce} from 'lodash'
import {MaybeRef, readonly, ref} from 'vue'

import {DragEvent, useElementDrag} from './useElementDrag'

// 慣性スクロールを無効化するまでの指を動かさないでいる時間 (sec)
const InertiaCancelDuration = 0.2

// 慣性スクロールが効き始める最低速度 (vh/sec)
const MinInertiaScrollSpeedInVh = 10

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

export function useVirtualScroll(
	el: MaybeRef<HTMLElement | null>,
	options: UseVirtualScrollOptions
) {
	const scroll = ref(0)

	let swipeDelta = 0

	/** Pepresented in px / second */
	let inertiaSpeed = 0

	let easeSpeedOptions: null | {
		get: () => number
		onReach: () => void
	} = null

	useEventListener(el, 'wheel', onWheel)

	// Scroll by wheel
	let wheelScrollOrigin: null | number = null
	function onWheel(e: WheelEvent) {
		swipeDelta = inertiaSpeed = 0

		scroll.value = options.mapScroll(scroll.value + e.deltaY)

		if (wheelScrollOrigin === null) {
			options.onPointerdown({
				offset: 0,
				delta: 0,
			})
		}

		options.onSwipe({
			offset: 0,
			delta: e.deltaY,
		})

		willTriggerOnPointerup()
	}

	const willTriggerOnPointerup = debounce(() => {
		options.onPointerup({
			offset: 0,
			delta: 0,
		})

		wheelScrollOrigin = null
	}, 100)

	// Scroll by swipe

	const {dragging} = useElementDrag(el, {
		onPointerdown,
		onDrag,
		onPointerup,
	})

	function onPointerdown() {
		cancelInertia()

		options.onPointerdown({
			offset: 0,
			delta: 0,
		})
	}

	function onDrag(e: DragEvent) {
		scroll.value = options.mapScroll(scroll.value - e.movement[1])

		swipeDelta += e.movement[1]

		onLongPress()

		options.onSwipe({
			offset: e.offset[1],
			delta: -e.movement[1],
		})
	}

	const onLongPress = debounce(
		() => {
			if (!dragging.value) return
			cancelInertia()
		},
		InertiaCancelDuration * 1000,
		{}
	)

	function onPointerup(e: DragEvent) {
		const minInertiaSpeed =
			(window.innerHeight * MinInertiaScrollSpeedInVh) / 100

		if (Math.abs(inertiaSpeed) < minInertiaSpeed) {
			inertiaSpeed = 0
		}

		swipeDelta = 0

		options.onPointerup({
			offset: e.offset[1],
			delta: 0,
		})
	}

	// Inertial scrolling
	useRafFn(({delta: deltaTimeMs}) => {
		const deltaTime = deltaTimeMs / 1000
		const swipeSpeed = swipeDelta / deltaTime
		swipeDelta = 0

		// Lerp inertiaSpeed to swipeSpeed
		if (deltaTime > 0) {
			const directionChanged = swipeSpeed * inertiaSpeed < 0
			const swipeSpeedExceeded = Math.abs(swipeSpeed) > Math.abs(inertiaSpeed)

			if (directionChanged || swipeSpeedExceeded) {
				inertiaSpeed = swipeSpeed
			} else {
				const halfLife = dragging.value ? 0.05 : 1
				const ratio = 1 - 2 ** (-deltaTime / halfLife)

				inertiaSpeed = scalar.lerp(inertiaSpeed, swipeSpeed, ratio)
			}

			// Accelate/decelerate to the target speed
			if (easeSpeedOptions !== null) {
				const targetSpeed = easeSpeedOptions.get()
				const doAccelate = targetSpeed > inertiaSpeed

				const diff =
					Math.abs(inertiaSpeed - targetSpeed) / Math.abs(targetSpeed)

				const rate = scalar.efit(diff, 0, 10, 1000, 5000)

				inertiaSpeed += (doAccelate ? 1 : -1) * rate * deltaTime

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
			const delta = inertiaSpeed * deltaTime
			scroll.value = options.mapScroll(scroll.value - delta)
		}
	})

	function cancelInertia() {
		swipeDelta = inertiaSpeed = 0
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
