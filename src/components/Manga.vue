<script setup lang="ts">
import {useElementSize} from '@vueuse/core'
import {computed, ref} from 'vue'

interface MangaPage {
	src: string
	width: number
	height: number
}

const props = defineProps<{
	pages: MangaPage[]
	scroll: number
}>()

defineEmits<{
	touchend: [e: TouchEvent]
}>()

const $root = ref<HTMLElement | null>(null)

const {width: pageWidth, height: pageHeight} = useElementSize($root)

const pageAttrs = computed(() => {
	const scale = pageWidth.value / props.pages[0].width
	let top = 0

	return props.pages.map((page, i) => {
		const y = top - props.scroll
		const height = page.height * scale

		top += page.height * scale

		if (y > pageHeight.value || y < -height) {
			return {...props.pages[i], style: {display: 'none'}}
		}

		return {
			src: page.src,
			width: page.width,
			height: page.height,
			style: {
				transform: `translate3d(0, ${y}px, 0)`,
			},
		}
	})
})
</script>

<template>
	<div class="Manga" ref="$root" @touchend="$emit('touchend', $event)">
		<div class="pages">
			<img
				class="page"
				v-for="page in pageAttrs"
				:key="page.src"
				v-bind="page"
			/>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.Manga
	position absolute
	inset 0
	background white

.page
	position absolute
	top 0
	display block
	width 100%
	height auto
	image-rendering pixelated
	pointer-events none
</style>
