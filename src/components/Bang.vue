<script lang="ts" setup>
import {range} from 'lodash'
import {onMounted, ref} from 'vue'

import {mangaWidth} from '@/manga'
import {useAppSettingsStore} from '@/store/appSettings'

const $canvas = ref<HTMLCanvasElement | null>(null)

const settings = useAppSettingsStore()

let ctx: CanvasRenderingContext2D | null = null

interface Bang {
	type: string
	start: number
	x: number
}

const bangs: Bang[] = []

onMounted(() => {
	const canvas = $canvas.value!
	canvas.width = mangaWidth
	canvas.height = 120

	ctx = canvas.getContext('2d')!

	update()
})

const spriteData = {
	mid: {src: './assets/bang_sprite.webp', duration: 6},
}

const sprites: Record<string, ImageBitmap[]> = {}

Object.entries(spriteData).forEach(([key, {src, duration}]) => {
	const img = new Image()
	img.src = src

	img.onload = async () => {
		const spriteHeight = img.height / duration

		sprites[key] = await Promise.all(
			range(duration).map(i =>
				createImageBitmap(img, 0, i * spriteHeight, img.width, spriteHeight)
			)
		)
	}
})

function bangAt(x: number) {
	bangs.push({
		type: 'mid',
		start: Date.now(),
		x,
	})
}

function update() {
	if (!ctx) return

	ctx.clearRect(0, 0, mangaWidth, ctx.canvas.height)
	ctx.globalCompositeOperation = 'lighter'

	for (const bang of bangs) {
		const elapsed = Date.now() - bang.start
		const frame = Math.floor((elapsed / 1000) * 24)
		const sprite = sprites[bang.type]

		if (frame >= sprite.length) {
			bangs.shift()
			continue
		}

		const img = sprite[frame]
		ctx.drawImage(img, bang.x - img.width / 2, 0)
	}

	ctx.globalCompositeOperation = 'source-in'
	ctx.fillStyle = settings.currentTheme.primary
	ctx.fillRect(0, 0, mangaWidth, ctx.canvas.height)

	requestAnimationFrame(update)
}

defineExpose({
	bangAt,
})
</script>

<template>
	<canvas class="Bang" ref="$canvas" />
</template>

<style lang="stylus" scoped>
.Bang
	position absolute
	left 0
	// opacity 0.4
	right 0
	margin-top calc(-60 * var(--px))
	height calc(120 * var(--px))
	width var(--manga-width)
	position absolute
</style>
