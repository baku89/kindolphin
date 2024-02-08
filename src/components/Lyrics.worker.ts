import {type vec3} from 'linearly'

self.addEventListener('message', ({data: {type, data}}) => {
	switch (type) {
		case 'preloadImages':
			preloadImages(data)
			break

		case 'setPrimaryColor':
			primaryRGB = data
			lastDrawn.forEach(({src, frame}, id) => drawLyric(id, src, frame))
			break

		case 'sendOffscreenCanvas':
			onReceiveOffscreenCanvas(data.id, data.canvas)
			break

		case 'drawLyric':
			drawLyric(data.id, data.src, data.frame)
			break
	}
})

const images: Map<string, Uint8ClampedArray> = new Map()
let primaryRGB: vec3 = [0, 0, 0]

const contexts = new Map<
	number,
	{ctx: OffscreenCanvasRenderingContext2D; pix: ImageData}
>()

let toBufferContext: OffscreenCanvasRenderingContext2D
function bmpToBuffer(bmp: ImageBitmap) {
	if (!toBufferContext) {
		const canvas = new OffscreenCanvas(1, 1)
		toBufferContext = canvas.getContext('2d')!
	}

	toBufferContext.canvas.width = bmp.width
	toBufferContext.canvas.height = bmp.height

	toBufferContext.drawImage(bmp, 0, 0)
	const pix = toBufferContext.getImageData(0, 0, bmp.width, bmp.height)
	const buffer = new Uint8ClampedArray(pix.data.length / 4)
	for (let i = 0; i < buffer.length; i++) {
		buffer[i] = pix.data[i * 4]
	}

	return buffer
}

function preloadImages(srcs: string[]) {
	for (const src of srcs) {
		fetch(src)
			.then(res => res.blob())
			.then(createImageBitmap)
			.then(bmpToBuffer)
			.then(img => images.set(src, img))
	}
}

const thresholds = [0.58, 0.03, 0.09, 0.15, 0.433333, 0.716667, 1].map(i =>
	Math.round(i * 255)
)

function onReceiveOffscreenCanvas(id: number, canvas: OffscreenCanvas) {
	const ctx = canvas.getContext('2d', {willReadFrequently: true})!
	canvas.width = 145
	canvas.height = 229
	const pix = ctx.createImageData(145, 229)
	contexts.set(id, {ctx, pix})
}

const lastDrawn = new Map<number, {src: string; frame: number}>()

function drawLyric(id: number, src: string, frame: number) {
	const {ctx, pix} = contexts.get(id)!

	if (src === '') {
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
	} else {
		const img = images.get(src)

		if (img) {
			const threshold = thresholds[frame]
			const [r, g, b] = primaryRGB

			for (let i = 0; i < img.length; i++) {
				pix.data[i * 4 + 3] = img[i] >= threshold ? 255 : 0
				pix.data[i * 4] = r
				pix.data[i * 4 + 1] = g
				pix.data[i * 4 + 2] = b
			}

			ctx.putImageData(pix, 0, 0)
		}
	}

	lastDrawn.set(id, {src, frame})

	self.postMessage({type: 'lyricDrawn', data: id})
}
