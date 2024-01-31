<script setup lang="ts">
import {useCssVar, useElementSize} from '@vueuse/core'
import {computed, ImgHTMLAttributes, ref, ReservedProps, watchEffect} from 'vue'

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

const pageAttrs = computed<ImgAttrs[]>(() => {
	const scale = pageWidth.value / props.pages[0].width
	let top = 0

	return props.pages.map((page, i) => {
		const y = top - props.scroll
		const height = page.height * scale

		const aspectRatio = page.width / page.height

		top += page.height * scale

		if (y > pageHeight.value || y < -height) {
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

const colorBg = useCssVar('--color-bg')
const colorInk = useCssVar('--color-ink')

watchEffect(() => {
	console.log(colorBg.value, colorInk.value)
})
</script>

<template>
	<div class="Manga" ref="$root" @touchend="$emit('touchend', $event)">
		<div class="bg-overlay" />
		<div class="ink-overlay" />
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
	background var(--color-bg)

.bg-overlay
.ink-overlay
	position absolute
	inset 0
	z-index 10

.bg-overlay
	background var(--color-bg)
	mix-blend-mode darken

.ink-overlay
	background var(--color-ink)
	mix-blend-mode lighten

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
