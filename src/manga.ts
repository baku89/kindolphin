export const mangaWidth = 324

export const mangaHeights = [
	597, 695, 740, 765, 1211, 937, 716, 1246, 527, 1142, 538, 1689, 1211, 1135,
	1783, 1197, 1144, 1123, 1215, 1529, 1162, 1323, 1159, 851, 1422, 1178, 1541,
	1753, 1018, 914,
]

const mangaTotalHeightOriginal = mangaHeights.reduce((a, b) => a + b, 0)

export interface MangaPage {
	src: string
	width: number
	height: number
}

export const mangaPages: MangaPage[] = [
	{src: './assets/manga_subpage/manga_00_00.webp', width: 324, height: 74},
	{src: './assets/manga_subpage/manga_00_01.webp', width: 324, height: 334},
	{src: './assets/manga_subpage/manga_00_02.webp', width: 324, height: 129},
	{src: './assets/manga_subpage/manga_00_03.webp', width: 324, height: 60},
	{src: './assets/manga_subpage/manga_01_00.webp', width: 324, height: 695},
	{src: './assets/manga_subpage/manga_02_00.webp', width: 324, height: 339},
	{src: './assets/manga_subpage/manga_02_01.webp', width: 324, height: 401},
	{src: './assets/manga_subpage/manga_03_00.webp', width: 324, height: 765},
	{src: './assets/manga_subpage/manga_04_03.webp', width: 324, height: 1211},
	{src: './assets/manga_subpage/manga_05_00.webp', width: 324, height: 937},
	{src: './assets/manga_subpage/manga_06_00.webp', width: 324, height: 716},
	{src: './assets/manga_subpage/manga_07_00.webp', width: 324, height: 130},
	{src: './assets/manga_subpage/manga_07_01.webp', width: 324, height: 175},
	{src: './assets/manga_subpage/manga_07_02.webp', width: 324, height: 941},
	{src: './assets/manga_subpage/manga_08_00.webp', width: 324, height: 163},
	{src: './assets/manga_subpage/manga_08_01.webp', width: 324, height: 364},
	{src: './assets/manga_subpage/manga_09_00.webp', width: 324, height: 217},
	{src: './assets/manga_subpage/manga_09_01.webp', width: 324, height: 611},
	{src: './assets/manga_subpage/manga_09_02.webp', width: 324, height: 314},
	{src: './assets/manga_subpage/manga_10_00.webp', width: 324, height: 118},
	{src: './assets/manga_subpage/manga_10_01.webp', width: 324, height: 107},
	{src: './assets/manga_subpage/manga_10_02.webp', width: 324, height: 177},
	{src: './assets/manga_subpage/manga_10_03.webp', width: 324, height: 136},
	{src: './assets/manga_subpage/manga_11_00.webp', width: 324, height: 1689},
	{src: './assets/manga_subpage/manga_12_00.webp', width: 324, height: 112},
	{src: './assets/manga_subpage/manga_12_01.webp', width: 324, height: 594},
	{src: './assets/manga_subpage/manga_12_02.webp', width: 324, height: 505},
	{src: './assets/manga_subpage/manga_13_00.webp', width: 324, height: 1135},
	{src: './assets/manga_subpage/manga_14_00.webp', width: 324, height: 296},
	{src: './assets/manga_subpage/manga_14_01.webp', width: 324, height: 677},
	{src: './assets/manga_subpage/manga_14_02.webp', width: 324, height: 810},
	{src: './assets/manga_subpage/manga_15_00.webp', width: 324, height: 1197},
	{src: './assets/manga_subpage/manga_16_00.webp', width: 324, height: 335},
	{src: './assets/manga_subpage/manga_16_01.webp', width: 324, height: 165},
	{src: './assets/manga_subpage/manga_16_02.webp', width: 324, height: 644},
	{src: './assets/manga_subpage/manga_17_00.webp', width: 324, height: 817},
	{src: './assets/manga_subpage/manga_17_01.webp', width: 324, height: 306},
	{src: './assets/manga_subpage/manga_18_00.webp', width: 324, height: 641},
	{src: './assets/manga_subpage/manga_18_01.webp', width: 324, height: 574},
	{src: './assets/manga_subpage/manga_19_00.webp', width: 324, height: 680},
	{src: './assets/manga_subpage/manga_19_01.webp', width: 324, height: 298},
	{src: './assets/manga_subpage/manga_19_02.webp', width: 324, height: 551},
	{src: './assets/manga_subpage/manga_20_00.webp', width: 324, height: 671},
	{src: './assets/manga_subpage/manga_20_01.webp', width: 324, height: 170},
	{src: './assets/manga_subpage/manga_20_02.webp', width: 324, height: 321},
	{src: './assets/manga_subpage/manga_21_00.webp', width: 324, height: 410},
	{src: './assets/manga_subpage/manga_21_01.webp', width: 324, height: 913},
	{src: './assets/manga_subpage/manga_22_00.webp', width: 324, height: 1159},
	{src: './assets/manga_subpage/manga_23_00.webp', width: 324, height: 851},
	{src: './assets/manga_subpage/manga_24_00.webp', width: 324, height: 519},
	{src: './assets/manga_subpage/manga_24_01.webp', width: 324, height: 429},
	{src: './assets/manga_subpage/manga_24_02.webp', width: 324, height: 338},
	{src: './assets/manga_subpage/manga_24_03.webp', width: 324, height: 136},
	{src: './assets/manga_subpage/manga_25_00.webp', width: 324, height: 254},
	{src: './assets/manga_subpage/manga_25_01.webp', width: 324, height: 174},
	{src: './assets/manga_subpage/manga_25_02.webp', width: 324, height: 202},
	{src: './assets/manga_subpage/manga_25_03.webp', width: 324, height: 548},
	{src: './assets/manga_subpage/manga_26_00.webp', width: 324, height: 482},
	{src: './assets/manga_subpage/manga_26_01.webp', width: 324, height: 368},
	{src: './assets/manga_subpage/manga_26_02.webp', width: 324, height: 691},
	{src: './assets/manga_subpage/manga_27_00.webp', width: 324, height: 677},
	{src: './assets/manga_subpage/manga_27_01.webp', width: 324, height: 1076},
	{src: './assets/manga_subpage/manga_28_00.webp', width: 324, height: 235},
	{src: './assets/manga_subpage/manga_28_01.webp', width: 324, height: 285},
	{src: './assets/manga_subpage/manga_28_02.webp', width: 324, height: 498},
	{src: './assets/manga_subpage/manga_29_00.webp', width: 324, height: 914},
]

export const mangaTotalHeight = mangaPages.reduce((a, b) => a + b.height, 0)

if (mangaTotalHeight !== mangaTotalHeightOriginal) {
	throw new Error(
		`mangaTotalHeight (${mangaTotalHeight}) !== mangaTotalHeightOriginal (${mangaTotalHeightOriginal})`
	)
}
