export const mangaWidth = 324

export const mangaHeights = [
	597, 695, 740, 765, 1211, 937, 716, 1246, 527, 1142, 538, 1689, 1211, 1133,
	1783, 1197, 1144, 1123, 1215, 1529, 1162, 1323, 1159, 851, 1422, 1178, 1541,
	1753, 1018, 914,
]

export const mangaTotalHeight = mangaHeights.reduce((a, b) => a + b, 0)

export const mangaPages = mangaHeights.map((height, i) => ({
	src: `./assets/manga_${i.toString().padStart(2, '0')}.webp`,
	width: mangaWidth,
	height,
}))
