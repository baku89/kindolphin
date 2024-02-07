import {type vec3} from 'linearly'

self.addEventListener('message', ({data: {type, data}}) => {
	switch (type) {
		case 'preloadImages':
			preloadImages(data)
			break

		case 'setPrimaryColor':
			primaryRGB = data
			break

		case 'sendOffscreenCanvas':
			onReceiveOffscreenCanvas(data.id, data.canvas)
			break

		case 'drawLyric':
			drawLyric(data.id, data.src, data.frame)
			break
	}
})

const images: Map<string, ImageBitmap> = new Map()
let primaryRGB: vec3 = [0, 0, 0]

const contexts = new Map<number, OffscreenCanvasRenderingContext2D>()

function preloadImages(srcs: string[]) {
	for (const src of srcs) {
		fetch(src)
			.then(res => res.blob())
			.then(createImageBitmap)
			.then(img => {
				images.set(src, img)
			})
	}
}

const thresholds = [0.58, 0.03, 0.09, 0.15, 0.433333, 0.716667, 1].map(i =>
	Math.round(i * 255)
)

const lastDrawnLyric = new Map<number, {src: string; frame: number}>()

function onReceiveOffscreenCanvas(id: number, canvas: OffscreenCanvas) {
	const ctx = canvas.getContext('2d', {willReadFrequently: true})!
	contexts.set(id, ctx)
}

function drawLyric(id: number, src: string, frame: number) {
	const lastDrawn = lastDrawnLyric.get(id)
	if (lastDrawn && lastDrawn.src === src && lastDrawn.frame === frame) {
		return
	}

	const ctx = contexts.get(id)!
	const img = images.get(src)!

	ctx.canvas.width = img.width
	ctx.canvas.height = img.height

	const threshold = thresholds[frame]
	const [r, g, b] = primaryRGB
	const {width, height} = img

	ctx.drawImage(img, 0, 0, width, height)

	const pix = ctx.getImageData(0, 0, width, height)

	for (let i = 0; i < pix.data.length; i += 4) {
		pix.data[i + 3] = pix.data[i] >= threshold ? 255 : 0
		pix.data[i] = r
		pix.data[i + 1] = g
		pix.data[i + 2] = b
	}

	ctx.putImageData(pix, 0, 0)

	lastDrawnLyric.set(id, {src, frame})
}
