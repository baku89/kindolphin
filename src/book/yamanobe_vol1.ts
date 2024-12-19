import {Book, Page} from './type'

export const pages: Page[] = [
	{
		src: './assets/yamanobe_vol1/yamanobe_vol1_00.webp',
		width: 690,
		height: 2853,
	},
	{
		src: './assets/yamanobe_vol1/yamanobe_vol1_01.webp',
		width: 690,
		height: 701,
	},
	{
		src: './assets/yamanobe_vol1/yamanobe_vol1_02.webp',
		width: 690,
		height: 936,
	},
	{
		src: './assets/yamanobe_vol1/yamanobe_vol1_03.webp',
		width: 690,
		height: 1490,
	},
	{
		src: './assets/yamanobe_vol1/yamanobe_vol1_04.webp',
		width: 690,
		height: 2350,
	},
	{
		src: './assets/yamanobe_vol1/yamanobe_vol1_05.webp',
		width: 690,
		height: 450,
	},
	{
		src: './assets/yamanobe_vol1/yamanobe_vol1_06.webp',
		width: 690,
		height: 1835,
	},
	{
		src: './assets/yamanobe_vol1/yamanobe_vol1_07.webp',
		width: 690,
		height: 2212,
	},
	{
		src: './assets/yamanobe_vol1/yamanobe_vol1_08.webp',
		width: 690,
		height: 455,
	},
	{
		src: './assets/yamanobe_vol1/yamanobe_vol1_09.webp',
		width: 690,
		height: 1111,
	},
	{
		src: './assets/yamanobe_vol1/yamanobe_vol1_10.webp',
		width: 690,
		height: 1856,
	},
	{
		src: './assets/yamanobe_vol1/yamanobe_vol1_11.webp',
		width: 690,
		height: 1808,
	},
	{
		src: './assets/yamanobe_vol1/yamanobe_vol1_12.webp',
		width: 690,
		height: 1389,
	},
]

export const BookYamanobeVol1: Book = {
	pages,
	width: 690,
	totalHeight: pages.reduce((acc, page) => acc + page.height, 0),
	homeTitle: '山野辺教授の超常事件簿 (1)',
	appBarTitle: '山野辺教授の超常事件簿 (1)',
	thumbSrc: './assets/cover_yamanobe_vol1.png',
}
