<script setup lang="ts">
import {useElementSize, useWindowSize} from '@vueuse/core'
import {computed, ImgHTMLAttributes, ref, ReservedProps} from 'vue'

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

type ImgAttrs = ImgHTMLAttributes & ReservedProps & Record<string, unknown>

// const {top: marginTop, bottom} = useElementBounding($root)

const {height: windowHeight} = useWindowSize()

// const marginBottom = computed(() => {
// 	return windowHeight.value - bottom.value
// })

const marginTop = computed(() => windowHeight.value * 0.5)
const marginBottom = computed(() => windowHeight.value * 0.5)

const pageAttrs = computed<ImgAttrs[]>(() => {
	const scale = pageWidth.value / props.pages[0].width
	let top = 0

	return props.pages.flatMap((page, i) => {
		const y = top - props.scroll
		const height = page.height * scale

		const aspectRatio = page.width / page.height

		top += page.height * scale

		if (
			y > pageHeight.value + marginBottom.value ||
			y < -height - marginTop.value
		) {
			return []
		}

		return [
			{
				key: page.src,
				src: page.src,
				style: {
					transform: `translate3d(0, ${y}px, 0)`,
					aspectRatio,
				},
			},
		]
	})
})
</script>

<template>
	<div class="Manga" ref="$root" @touchend="$emit('touchend', $event)">
		<div class="bottom-ink" />
		<div class="pages">
			<img
				class="page"
				v-for="page in pageAttrs"
				:key="page.key"
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

.bottom-ink
	position absolute
	top 99%
	left 0
	right 0
	bottom calc(-1 * var(--footer-height))
	background black

.page
	position absolute
	top 0
	display block
	width 100%
	height auto
	pointer-events none
	will-change visibility, transform
	object-fit fill
	background-image url('/assets/scroll_effect_line.png')
	background-size 100% 100%
	filter url('#tint')
</style>
