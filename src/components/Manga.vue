<script setup lang="ts">
import {useElementBounding, useElementSize, useWindowSize} from '@vueuse/core'
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

const {top: marginTop, bottom} = useElementBounding($root)
const {height: windowHeight} = useWindowSize()

const marginBottom = computed(() => {
	return windowHeight.value - bottom.value
})

const pageAttrs = computed<ImgAttrs[]>(() => {
	const scale = pageWidth.value / props.pages[0].width
	let top = 0

	return props.pages.map((page, i) => {
		const y = top - props.scroll
		const height = page.height * scale

		const aspectRatio = page.width / page.height

		top += page.height * scale

		if (
			y > pageHeight.value + marginBottom.value ||
			y < -height - marginTop.value
		) {
			return {
				...props.pages[i],
				key: props.pages[i].src,
				src: 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
				style: {visibility: 'hidden', aspectRatio},
			}
		}

		return {
			key: page.src,
			src: page.src,
			style: {
				transform: `translate3d(0, ${y}px, 0)`,
				aspectRatio,
			},
		}
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
		<div class="bg-overlay" />
		<div class="ink-overlay" />
	</div>
</template>

<style lang="stylus" scoped>
.Manga
	position absolute
	inset 0
	background var(--color-bg)

.bg-overlay
.ink-overlay
	position fixed
	inset 0

.bg-overlay
	background var(--color-bg)
	mix-blend-mode darken

.ink-overlay
	background var(--color-ink)
	mix-blend-mode lighten

.bottom-ink
	position absolute
	top 99%
	left 0
	right 0
	bottom calc(-1 * var(--footer-height))
	background var(--color-ink)

.page
	position absolute
	top 0
	display block
	width 100%
	height auto
	image-rendering pixelated
	pointer-events none
	will-change visibility, transform
	object-fit fill
	background-image url('/assets/scroll_effect_line.png')
	background-size 100% 100%
	filter url('#tint')
</style>
