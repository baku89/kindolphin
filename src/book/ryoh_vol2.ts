import {Book, Page} from './type'

export const pages: Page[] = [
	{src: './assets/ryoh_vol1/ryoh_vol1_00.webp', width: 613, height: 341},
]

export const BookRyohVol2: Book = {
	pages,
	width: 613,
	totalHeight: pages.reduce((acc, page) => acc + page.height, 0),
	homeTitle: '調味マスターリョウ 第2味 俺の味は並じゃないでやー！',
	appBarTitle: '調味マスターリョウ (第2味)',
	thumbSrc: './assets/cover_ryoh_vol2.png',
}
