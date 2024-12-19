import {Book, Page} from './type'

export const pages: Page[] = [
	{src: './assets/ryoh_vol1/ryoh_vol1_00.webp', width: 613, height: 341},
	{src: './assets/ryoh_vol1/ryoh_vol1_01.webp', width: 613, height: 1335},
	{src: './assets/ryoh_vol1/ryoh_vol1_02.webp', width: 613, height: 805},
	{src: './assets/ryoh_vol1/ryoh_vol1_03.webp', width: 613, height: 438},
	{src: './assets/ryoh_vol1/ryoh_vol1_04.webp', width: 613, height: 519},
	{src: './assets/ryoh_vol1/ryoh_vol1_05.webp', width: 613, height: 568},
	{src: './assets/ryoh_vol1/ryoh_vol1_06.webp', width: 613, height: 1085},
	{src: './assets/ryoh_vol1/ryoh_vol1_07.webp', width: 613, height: 1072},
]

export const BookRyohVol1: Book = {
	pages,
	width: 613,
	totalHeight: pages.reduce((acc, page) => acc + page.height, 0),
	homeTitle: '調味マスターリョウ 第1味 俺の名前はショッパ リョウでやー！',
	appBarTitle: '調味マスターリョウ (第1味)',
	thumbSrc: './assets/cover_ryoh_vol1.png',
}
