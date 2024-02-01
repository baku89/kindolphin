export const mangaWidth = 324

export const mangaHeights = [
	597, 695, 740, 765, 1211, 937, 716, 1246, 527, 1142, 538, 1689, 1211, 1133,
	1783, 1197, 1144, 1123, 1215, 1529, 1162, 1323, 1159, 851, 1422, 1178, 1541,
	1753, 1018, 914,
]

const mangaTotalHeightOriginal = mangaHeights.reduce((a, b) => a + b, 0)

// export const mangaPages = mangaHeights.map((height, i) => ({
// 	src: `./assets/manga_${i.toString().padStart(2, '0')}.webp`,
// 	width: mangaWidth,
// 	height,
// }))

const subpageHeights: [src: string, height: number][] = [
	['./assets/manga_subpage/manga_00_01.webp', 74],
	['./assets/manga_subpage/manga_00_02.webp', 334],
	['./assets/manga_subpage/manga_00_03.webp', 129],
	['./assets/manga_subpage/manga_00_04.webp', 60],
	['./assets/manga_subpage/manga_01_01.webp', 695],
	['./assets/manga_subpage/manga_02_01.webp', 339],
	['./assets/manga_subpage/manga_02_02.webp', 401],
	['./assets/manga_subpage/manga_03_01.webp', 765],
	['./assets/manga_subpage/manga_04_01.webp', 1211],
	...mangaHeights
		.slice(10)
		.map(
			(height, i) =>
				[
					`./assets/manga_${(i + 5).toString().padStart(2, '0')}.webp`,
					height,
				] as [string, number]
		),
]

export const mangaTotalHeight = subpageHeights.reduce((a, b) => a + b[1], 0)

if (mangaTotalHeight !== mangaTotalHeightOriginal) {
	throw new Error('mangaTotalHeight !== mangaTotalHeightOriginal')
}

export const mangaPages = subpageHeights.map(([src, height]) => ({
	src,
	width: mangaWidth,
	height,
}))
