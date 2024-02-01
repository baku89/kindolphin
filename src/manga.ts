export const mangaWidth = 324

export const mangaHeights = [
	597, 695, 740, 765, 1211, 937, 716, 1246, 527, 1142,

	538,

	1689, 1211, 1133, 1783, 1197, 1144, 1123, 1215, 1529, 1162, 1323, 1159, 851,
	1422, 1178, 1541, 1753, 1018, 914,
]

const mangaTotalHeightOriginal = mangaHeights.reduce((a, b) => a + b, 0)

// export const mangaPages = mangaHeights.map((height, i) => ({
// 	src: `./assets/manga_${i.toString().padStart(2, '0')}.webp`,
// 	width: mangaWidth,
// 	height,
// }))

const subpageHeights: [src: string, height: number][] = [
	['./assets/manga_subpage/manga_00_00.webp', 74],
	['./assets/manga_subpage/manga_00_01.webp', 334],
	['./assets/manga_subpage/manga_00_02.webp', 129],
	['./assets/manga_subpage/manga_00_03.webp', 60],

	['./assets/manga_subpage/manga_01_00.webp', 695],

	['./assets/manga_subpage/manga_02_00.webp', 339],
	['./assets/manga_subpage/manga_02_01.webp', 401],

	['./assets/manga_subpage/manga_03_00.webp', 765],

	['./assets/manga_subpage/manga_04_03.webp', 1211],

	['./assets/manga_subpage/manga_05_00.webp', 937],

	['./assets/manga_subpage/manga_06_00.webp', 716],

	['./assets/manga_subpage/manga_07_00.webp', 130],
	['./assets/manga_subpage/manga_07_01.webp', 175],
	['./assets/manga_subpage/manga_07_02.webp', 941],

	['./assets/manga_subpage/manga_08_00.webp', 163],
	['./assets/manga_subpage/manga_08_01.webp', 364],

	['./assets/manga_subpage/manga_09_00.webp', 217],
	['./assets/manga_subpage/manga_09_01.webp', 611],
	['./assets/manga_subpage/manga_09_02.webp', 314],

	['./assets/manga_subpage/manga_10_00.webp', 118],
	['./assets/manga_subpage/manga_10_01.webp', 107],
	['./assets/manga_subpage/manga_10_02.webp', 177],
	['./assets/manga_subpage/manga_10_03.webp', 136],

	...mangaHeights
		.slice(11)
		.map(
			(height, i) =>
				[
					`./assets/manga_${(i + 11).toString().padStart(2, '0')}.webp`,
					height,
				] as [string, number]
		),
]

export const mangaTotalHeight = subpageHeights.reduce((a, b) => a + b[1], 0)

if (mangaTotalHeight !== mangaTotalHeightOriginal) {
	throw new Error(
		'mangaTotalHeight !== mangaTotalHeightOriginal ' +
			mangaTotalHeight +
			' ' +
			mangaTotalHeightOriginal
	)
}

export const mangaPages = subpageHeights.map(([src, height]) => ({
	src,
	width: mangaWidth,
	height,
}))
