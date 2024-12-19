import {Book, Page} from './type'

export const pages: Page[] = [
	{src: './assets/ryoh_vol3/ryoh_vol3_00.webp', width: 613, height: 2052},
	{src: './assets/ryoh_vol3/ryoh_vol3_01.webp', width: 613, height: 1120},
	{src: './assets/ryoh_vol3/ryoh_vol3_02.webp', width: 613, height: 1592},
	{src: './assets/ryoh_vol3/ryoh_vol3_03.webp', width: 613, height: 1460},
	{src: './assets/ryoh_vol3/ryoh_vol3_04.webp', width: 613, height: 1639},
	{src: './assets/ryoh_vol3/ryoh_vol3_05.webp', width: 613, height: 1250},
]

export const BookRyohVol3: Book = {
	pages,
	width: 613,
	totalHeight: pages.reduce((acc, page) => acc + page.height, 0),
	homeTitle: '調味マスターリョウ 第3味 塩 VS ソルトでやー!',
	appBarTitle: '調味マスターリョウ (第3味)',
	thumbSrc: './assets/cover_ryoh_vol3.png',
}
