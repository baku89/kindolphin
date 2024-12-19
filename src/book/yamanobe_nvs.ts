import {Book, Page} from './type'

export const pages: Page[] = [
	{src: './assets/yamanobe_nvs/yamanobe_nvs_00.webp', width: 550, height: 674},
	{src: './assets/yamanobe_nvs/yamanobe_nvs_01.webp', width: 550, height: 1635},
	{src: './assets/yamanobe_nvs/yamanobe_nvs_02.webp', width: 550, height: 1770},
	{src: './assets/yamanobe_nvs/yamanobe_nvs_03.webp', width: 550, height: 952},
	{src: './assets/yamanobe_nvs/yamanobe_nvs_04.webp', width: 550, height: 1510},
	{src: './assets/yamanobe_nvs/yamanobe_nvs_05.webp', width: 550, height: 2430},
	{src: './assets/yamanobe_nvs/yamanobe_nvs_06.webp', width: 550, height: 1421},
	{src: './assets/yamanobe_nvs/yamanobe_nvs_07.webp', width: 550, height: 1938},
	{src: './assets/yamanobe_nvs/yamanobe_nvs_08.webp', width: 550, height: 2877},
	{src: './assets/yamanobe_nvs/yamanobe_nvs_09.webp', width: 550, height: 2373},
	{src: './assets/yamanobe_nvs/yamanobe_nvs_10.webp', width: 550, height: 2332},
	{src: './assets/yamanobe_nvs/yamanobe_nvs_11.webp', width: 550, height: 2114},
	{src: './assets/yamanobe_nvs/yamanobe_nvs_12.webp', width: 550, height: 253},
]

export const BookYamanobeNvs: Book = {
	pages,
	width: 550,
	totalHeight: pages.reduce((acc, page) => acc + page.height, 0),
	homeTitle: '[PR] 山野辺教授の就職研究リポート白書',
	appBarTitle: '[PR] 山野辺教授の就職研究リポート白書',
	thumbSrc: './assets/cover_yamanobe_nvs.png',
}
