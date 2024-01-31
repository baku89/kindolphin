<script setup lang="ts">
import {defineAsyncComponent, watchEffect} from 'vue'

import {mangaPages} from '@/manga'
import {usePreload} from '@/use/usePreload'

const preload = usePreload()

mangaPages.forEach(page => {
	preload.fetch(page.src, page.height / 100)
})

watchEffect(() => {
	console.log('progress=', preload.progress)
})

const MangaReader = defineAsyncComponent(
	() => import('@/components/MangaReader.vue')
)
</script>

<template>
	<div class="PageIndex">
		<div v-if="preload.progress < 1" class="loading">
			<div class="loading-text">Loading...</div>
		</div>
		<MangaReader v-else />
	</div>
</template>

<style lang="stylus" scoped>
.PageIndex
	position fixed
	inset 0
	overflow hidden

.loading
	position relative
	width var(--manga-width)
	margin 0 auto
	font-size 30rem
	text-align center
</style>
