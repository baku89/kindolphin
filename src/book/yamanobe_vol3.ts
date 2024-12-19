import {Book, Page} from './type'

export const pages: Page[] = [
	{
		src: './assets/yamanobe_vol3/yamanobe_vol3_00.webp',
		width: 690,
		height: 1098,
	},
	{
		src: './assets/yamanobe_vol3/yamanobe_vol3_01.webp',
		width: 690,
		height: 1640,
	},
	{
		src: './assets/yamanobe_vol3/yamanobe_vol3_02.webp',
		width: 690,
		height: 400,
	},
	{
		src: './assets/yamanobe_vol3/yamanobe_vol3_03.webp',
		width: 690,
		height: 1071,
	},
	{
		src: './assets/yamanobe_vol3/yamanobe_vol3_04.webp',
		width: 690,
		height: 1226,
	},
	{
		src: './assets/yamanobe_vol3/yamanobe_vol3_05.webp',
		width: 690,
		height: 2223,
	},
	{
		src: './assets/yamanobe_vol3/yamanobe_vol3_06.webp',
		width: 690,
		height: 1843,
	},
	{
		src: './assets/yamanobe_vol3/yamanobe_vol3_07.webp',
		width: 690,
		height: 1497,
	},
	{
		src: './assets/yamanobe_vol3/yamanobe_vol3_08.webp',
		width: 690,
		height: 747,
	},
	{
		src: './assets/yamanobe_vol3/yamanobe_vol3_09.webp',
		width: 690,
		height: 1170,
	},
	{
		src: './assets/yamanobe_vol3/yamanobe_vol3_10.webp',
		width: 690,
		height: 855,
	},
	{
		src: './assets/yamanobe_vol3/yamanobe_vol3_11.webp',
		width: 690,
		height: 1290,
	},
	{
		src: './assets/yamanobe_vol3/yamanobe_vol3_12.webp',
		width: 690,
		height: 1001,
	},
	{
		src: './assets/yamanobe_vol3/yamanobe_vol3_13.webp',
		width: 690,
		height: 520,
	},
	{
		src: './assets/yamanobe_vol3/yamanobe_vol3_14.webp',
		width: 690,
		height: 1738,
	},
]

export const BookYamanobeVol3: Book = {
	pages,
	width: 690,
	totalHeight: pages.reduce((acc, page) => acc + page.height, 0),
	homeTitle: '山野辺教授の超常事件簿 (3)',
	appBarTitle: '山野辺教授の超常事件簿 (3)',
	thumbSrc: './assets/cover_yamanobe_vol3.png',
}
