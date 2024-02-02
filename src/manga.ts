export const mangaWidth = 324

export const mangaHeights = [
	597, 695, 740, 765, 1211, 937, 716, 1246, 527, 1142, 538, 1689, 1211, 1135,
	1783, 1197, 1144, 1123, 1215, 1529, 1162, 1323, 1159, 851, 1422, 1178, 1541,
	1753, 1018, 914,
]

const mangaTotalHeightOriginal = mangaHeights.reduce((a, b) => a + b, 0)

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
	['./assets/manga_subpage/manga_11_00.webp', 1689],
	['./assets/manga_subpage/manga_12_00.webp', 112],
	['./assets/manga_subpage/manga_12_01.webp', 594],
	['./assets/manga_subpage/manga_12_02.webp', 505],
	['./assets/manga_subpage/manga_13_00.webp', 1135],
	['./assets/manga_subpage/manga_14_00.webp', 296],
	['./assets/manga_subpage/manga_14_01.webp', 677],
	['./assets/manga_subpage/manga_14_02.webp', 810],
	['./assets/manga_subpage/manga_15_00.webp', 1197],
	['./assets/manga_subpage/manga_16_00.webp', 335],
	['./assets/manga_subpage/manga_16_01.webp', 165],
	['./assets/manga_subpage/manga_16_02.webp', 644],
	['./assets/manga_subpage/manga_17_00.webp', 817],
	['./assets/manga_subpage/manga_17_01.webp', 306],
	['./assets/manga_subpage/manga_18_00.webp', 641],
	['./assets/manga_subpage/manga_18_01.webp', 574],
	['./assets/manga_subpage/manga_19_00.webp', 680],
	['./assets/manga_subpage/manga_19_01.webp', 298],
	['./assets/manga_subpage/manga_19_02.webp', 551],
	['./assets/manga_subpage/manga_20_00.webp', 671],
	['./assets/manga_subpage/manga_20_01.webp', 170],
	['./assets/manga_subpage/manga_20_02.webp', 321],
	['./assets/manga_subpage/manga_21_00.webp', 410],
	['./assets/manga_subpage/manga_21_01.webp', 913],
	['./assets/manga_subpage/manga_22_00.webp', 1159],
	['./assets/manga_subpage/manga_23_00.webp', 851],
	['./assets/manga_subpage/manga_24_00.webp', 519],
	['./assets/manga_subpage/manga_24_01.webp', 429],
	['./assets/manga_subpage/manga_24_02.webp', 338],
	['./assets/manga_subpage/manga_24_03.webp', 136],
	['./assets/manga_subpage/manga_25_00.webp', 254],
	['./assets/manga_subpage/manga_25_01.webp', 174],
	['./assets/manga_subpage/manga_25_02.webp', 202],
	['./assets/manga_subpage/manga_25_03.webp', 548],
	['./assets/manga_subpage/manga_26_00.webp', 482],
	['./assets/manga_subpage/manga_26_01.webp', 368],
	['./assets/manga_subpage/manga_26_02.webp', 691],
	['./assets/manga_subpage/manga_27_00.webp', 677],
	['./assets/manga_subpage/manga_27_01.webp', 1076],
	['./assets/manga_subpage/manga_28_00.webp', 235],
	['./assets/manga_subpage/manga_28_01.webp', 285],
	['./assets/manga_subpage/manga_28_02.webp', 498],
	['./assets/manga_subpage/manga_29_00.webp', 914],
]

export const mangaTotalHeight = subpageHeights.reduce((a, b) => a + b[1], 0)

if (mangaTotalHeight !== mangaTotalHeightOriginal) {
	throw new Error(
		`mangaTotalHeight (${mangaTotalHeight}) !== mangaTotalHeightOriginal (${mangaTotalHeightOriginal})`
	)
}

export const mangaPages = subpageHeights.map(([src, height]) => ({
	src,
	width: mangaWidth,
	height,
}))
