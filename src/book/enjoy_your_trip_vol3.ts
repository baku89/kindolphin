import {Book, Page} from './type'

export const pages: Page[] = [
	{
		src: './assets/enjoy_your_trip_vol1/enjoy_your_trip_vol1_00.webp',
		width: 500,
		height: 125,
	},
	{
		src: './assets/enjoy_your_trip_vol1/enjoy_your_trip_vol1_01.webp',
		width: 500,
		height: 266,
	},
	{
		src: './assets/enjoy_your_trip_vol3/enjoy_your_trip_vol3_03.webp',
		width: 500,
		height: 2608,
	},
	{
		src: './assets/enjoy_your_trip_vol3/enjoy_your_trip_vol3_04.webp',
		width: 500,
		height: 220,
	},
	{
		src: './assets/enjoy_your_trip_vol3/enjoy_your_trip_vol3_05.webp',
		width: 500,
		height: 179,
	},
	{
		src: './assets/enjoy_your_trip_vol3/enjoy_your_trip_vol3_06.webp',
		width: 500,
		height: 702,
	},
	{
		src: './assets/enjoy_your_trip_vol3/enjoy_your_trip_vol3_07.webp',
		width: 500,
		height: 167,
	},
	{
		src: './assets/enjoy_your_trip_vol3/enjoy_your_trip_vol3_08.webp',
		width: 500,
		height: 490,
	},
	{
		src: './assets/enjoy_your_trip_vol3/enjoy_your_trip_vol3_09.webp',
		width: 500,
		height: 504,
	},
	{
		src: './assets/enjoy_your_trip_vol3/enjoy_your_trip_vol3_10.webp',
		width: 500,
		height: 987,
	},
	{
		src: './assets/enjoy_your_trip_vol3/enjoy_your_trip_vol3_11.webp',
		width: 500,
		height: 335,
	},
	{
		src: './assets/enjoy_your_trip_vol3/enjoy_your_trip_vol3_12.webp',
		width: 500,
		height: 1400,
	},
]

export const BookEnjoyYourTripVol3: Book = {
	pages,
	width: 500,
	totalHeight: pages.reduce((acc, page) => acc + page.height, 0),
	homeTitle: '79 / Enjoy Your Trip (3) <wbr />エピローグ',
	appBarTitle: '79 / Enjoy Your Trip (3)',
	thumbSrc: './assets/cover_enjoy_your_trip_vol3.png',
}
