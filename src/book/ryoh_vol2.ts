import {Book, Page} from './type'

export const pages: Page[] = [
	{src: './assets/ryoh_vol2/ryoh_vol2_00.webp', width: 613, height: 692},
	{src: './assets/ryoh_vol2/ryoh_vol2_01.webp', width: 613, height: 1277},
	{src: './assets/ryoh_vol2/ryoh_vol2_02.webp', width: 613, height: 686},
	{src: './assets/ryoh_vol2/ryoh_vol2_03.webp', width: 613, height: 2049},
	{src: './assets/ryoh_vol2/ryoh_vol2_04.webp', width: 613, height: 2504},
	{src: './assets/ryoh_vol2/ryoh_vol2_05.webp', width: 613, height: 971},
]

export const BookRyohVol2: Book = {
	pages,
	width: 613,
	totalHeight: pages.reduce((acc, page) => acc + page.height, 0),
	homeTitle: '調味マスターリョウ 第2味 俺の味は並じゃないでやー！',
	appBarTitle: '調味マスターリョウ (第2味)',
	thumbSrc: './assets/cover_ryoh_vol2.png',
}
