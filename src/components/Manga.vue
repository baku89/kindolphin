<script setup lang="ts">
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

const style = computed(() => {
	return {
		transform: `translate3d(0, -${props.scroll}px, 0)`,
	}
})

const root = ref<HTMLElement | null>(null)

defineExpose({root})
</script>

<template>
	<div class="Manga" ref="root" @touchend="$emit('touchend', $event)">
		<div class="pages" :style="style">
			<img class="page" v-for="(attrs, i) in pages" :key="i" v-bind="attrs" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.Manga
	position fixed
	inset 0
	background red

.page
	display block
	width 100%
	height auto
	image-rendering pixelated
	pointer-events none
</style>
