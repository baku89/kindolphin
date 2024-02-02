import {MaybeRef, onMounted, readonly, ref, unref} from 'vue'

export interface DragEvent {
	clientX: number
	clientY: number
	movementX: number
	movementY: number
	target: HTMLElement
}

interface UseElementDragOptions {
	onPointerdown?: (e: DragEvent) => void
	onDrag?: (e: DragEvent) => void
	onPointerup?: (e: DragEvent) => void
}

export function useElementDrag(
	el: MaybeRef<HTMLElement | null>,
	options: UseElementDragOptions
) {
	const dragging = ref(false)

	onMounted(() => {
		const $el = unref(el)
		if (!$el) return

		$el.addEventListener('mousedown', onPointerdown)
		$el.addEventListener('touchstart', onPointerdown)
	})

	let prevX = 0,
		prevY = 0

	function onPointerdown(e: MouseEvent | TouchEvent) {
		dragging.value = true

		const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX
		const clientY = 'clientY' in e ? e.clientY : e.touches[0].clientY

		const event: DragEvent = {
			clientX,
			clientY,
			movementX: 0,
			movementY: 0,
			target: e.target as HTMLElement,
		}

		prevX = clientX
		prevY = clientY

		options.onPointerdown?.(event)

		window.addEventListener('mousemove', onDrag)
		window.addEventListener('touchmove', onDrag)

		window.addEventListener('mouseup', onPointerup)
		window.addEventListener('mouseleave', onPointerup)
		window.addEventListener('touchcancel', onPointerup)
		window.addEventListener('touchend', onPointerup)
	}

	function onDrag(e: MouseEvent | TouchEvent) {
		const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX
		const clientY = 'clientY' in e ? e.clientY : e.touches[0].clientY

		const movementX = clientX - prevX
		const movementY = clientY - prevY

		const event: DragEvent = {
			clientX,
			clientY,
			movementX,
			movementY,
			target: e.target as HTMLElement,
		}

		prevX = clientX
		prevY = clientY

		options.onDrag?.(event)
	}

	function onPointerup(e: MouseEvent | TouchEvent) {
		dragging.value = false

		const clientX = 'clientX' in e ? e.clientX : prevX
		const clientY = 'clientY' in e ? e.clientY : prevY

		const event: DragEvent = {
			clientX,
			clientY,
			movementX: 0,
			movementY: 0,
			target: e.target as HTMLElement,
		}

		options.onPointerup?.(event)

		window.removeEventListener('mousemove', onDrag)
		window.removeEventListener('touchmove', onDrag)

		window.removeEventListener('mouseup', onPointerup)
		window.removeEventListener('mouseleave', onPointerup)
		window.removeEventListener('touchcancel', onPointerup)
		window.removeEventListener('touchend', onPointerup)
	}

	return {
		dragging: readonly(dragging),
	}
}
