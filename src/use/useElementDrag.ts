import {vec2} from 'linearly'
import {MaybeRef, onMounted, readonly, ref, unref} from 'vue'

export interface DragEvent {
	client: vec2
	movement: vec2
	offset: vec2
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

	let prev = vec2.zero
	let origin = vec2.zero

	function onPointerdown(e: MouseEvent | TouchEvent) {
		e.stopPropagation()
		e.preventDefault()

		dragging.value = true

		const client: vec2 = [
			'clientX' in e ? e.clientX : e.touches[0].clientX,
			'clientY' in e ? e.clientY : e.touches[0].clientY,
		]

		origin = client

		const event: DragEvent = {
			client,
			movement: vec2.zero,
			offset: vec2.zero,
			target: e.target as HTMLElement,
		}

		prev = client

		options.onPointerdown?.(event)

		window.addEventListener('mousemove', onDrag)
		window.addEventListener('touchmove', onDrag)

		window.addEventListener('mouseup', onPointerup)
		window.addEventListener('mouseleave', onPointerup)
		window.addEventListener('touchcancel', onPointerup)
		window.addEventListener('touchend', onPointerup)
	}

	function onDrag(e: MouseEvent | TouchEvent) {
		const client: vec2 = [
			'clientX' in e ? e.clientX : e.touches[0].clientX,
			'clientY' in e ? e.clientY : e.touches[0].clientY,
		]

		const movement = vec2.sub(client, prev)

		const event: DragEvent = {
			client,
			movement,
			offset: vec2.sub(client, origin),
			target: e.target as HTMLElement,
		}

		prev = client

		options.onDrag?.(event)
	}

	function onPointerup(e: MouseEvent | TouchEvent) {
		dragging.value = false

		const client: vec2 = [
			'clientX' in e ? e.clientX : prev[0],
			'clientY' in e ? e.clientY : prev[1],
		]

		const event: DragEvent = {
			client,
			movement: vec2.zero,
			offset: vec2.sub(client, origin),
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
