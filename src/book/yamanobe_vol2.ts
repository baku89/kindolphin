import {Book, Page} from './type'

export const pages: Page[] = [
	{
		src: './assets/yamanobe_vol2/yamanobe_vol2_00.webp',
		width: 690,
		height: 325,
	},
	{
		src: './assets/yamanobe_vol2/yamanobe_vol2_01.webp',
		width: 690,
		height: 927,
	},
	{
		src: './assets/yamanobe_vol2/yamanobe_vol2_02.webp',
		width: 690,
		height: 805,
	},
	{
		src: './assets/yamanobe_vol2/yamanobe_vol2_03.webp',
		width: 690,
		height: 527,
	},
	{
		src: './assets/yamanobe_vol2/yamanobe_vol2_04.webp',
		width: 690,
		height: 286,
	},
	{
		src: './assets/yamanobe_vol2/yamanobe_vol2_05.webp',
		width: 690,
		height: 1315,
	},
	{
		src: './assets/yamanobe_vol2/yamanobe_vol2_06.webp',
		width: 690,
		height: 467,
	},
	{
		src: './assets/yamanobe_vol2/yamanobe_vol2_07.webp',
		width: 690,
		height: 1300,
	},
	{
		src: './assets/yamanobe_vol2/yamanobe_vol2_08.webp',
		width: 690,
		height: 1101,
	},
	{
		src: './assets/yamanobe_vol2/yamanobe_vol2_09.webp',
		width: 690,
		height: 643,
	},
	{
		src: './assets/yamanobe_vol2/yamanobe_vol2_10.webp',
		width: 690,
		height: 917,
	},
	{
		src: './assets/yamanobe_vol2/yamanobe_vol2_11.webp',
		width: 690,
		height: 1430,
	},
	{
		src: './assets/yamanobe_vol2/yamanobe_vol2_12.webp',
		width: 690,
		height: 747,
	},
	{
		src: './assets/yamanobe_vol2/yamanobe_vol2_13.webp',
		width: 690,
		height: 1521,
	},
	{
		src: './assets/yamanobe_vol2/yamanobe_vol2_14.webp',
		width: 690,
		height: 1334,
	},
]

export const BookYamanobeVol2: Book = {
	pages,
	width: 690,
	totalHeight: pages.reduce((acc, page) => acc + page.height, 0),
	homeTitle: '山野辺教授の超常事件簿 (2)',
	appBarTitle: '山野辺教授の超常事件簿 (2)',
	thumbSrc: './assets/cover_yamanobe_vol2.png',
}
