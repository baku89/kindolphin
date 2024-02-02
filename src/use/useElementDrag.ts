import {MaybeRef, onMounted, unref} from 'vue'

interface UseElementDragOptions {
	onPointerdown: (e: PointerEvent) => void
	onDrag: (e: PointerEvent) => void
	onPointerup: (e: PointerEvent) => void
}

export function useElementDrag(
	el: MaybeRef<HTMLElement | null>,
	options: UseElementDragOptions
) {
	onMounted(() => {
		const $el = unref(el)
		if (!$el) return

		$el.addEventListener('pointerdown', onPointerdown)
	})

	function onPointerdown(e: PointerEvent) {
		options.onPointerdown(e)

		const target = e.target as HTMLElement

		target.setPointerCapture(e.pointerId)

		target.addEventListener('pointermove', onDrag)
		target.addEventListener('pointerup', onPointerup)
		target.addEventListener('pointercancel', onPointerup)
		target.addEventListener('pointerleave', onPointerup)
	}

	function onDrag(e: PointerEvent) {
		options.onDrag(e)
	}

	function onPointerup(e: PointerEvent) {
		options.onPointerup(e)

		const target = e.target as HTMLElement

		target.releasePointerCapture(e.pointerId)

		target.removeEventListener('pointermove', onDrag)
		target.removeEventListener('pointerup', onPointerup)
		target.removeEventListener('pointercancel', onPointerup)
		target.removeEventListener('pointerleave', onPointerup)
	}
}
