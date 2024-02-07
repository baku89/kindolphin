<script setup lang="ts">
import {useAppSettingsStore} from '@/store/appSettings'

import FadeBg from './FadeBg.vue'

defineProps<{
	show: boolean
}>()

defineEmits<{
	'update:show': [value: boolean]
}>()

const settings = useAppSettingsStore()
</script>

<template>
	<Transition>
		<FadeBg v-if="show" @click="$emit('update:show', false)" />
	</Transition>
	<div class="PaneSettings" ref="$root" :class="{show}">
		<section class="property">
			<h2 class="name">
				<span lang="ja">画面色</span><span lang="en">Page Color</span>
			</h2>
			<div class="value themes">
				<button
					v-for="(theme, i) in settings.themes"
					:key="i"
					:class="{active: i === settings.themeIndex}"
					@click="settings.themeIndex = i"
				>
					<span
						class="fa fa-sharp fa-solid fa-circle preview"
						:style="{color: theme.bg}"
					/>
				</button>
			</div>
		</section>
	</div>
</template>

<style lang="stylus" scoped>
.PaneSettings
	position fixed
	bottom 0
	left -1rem
	right -1rem
	border 1rem solid var(--theme-ink)
	border-bottom 0
	background var(--theme-bg)
	border-radius 20rem 20rem 0 0
	z-index 100
	font-size 16rem
	padding calc(2 * var(--nav-margin-horiz)) calc(2 * var(--nav-margin-horiz)) calc(2 * var(--nav-margin-horiz) + env(safe-area-inset-bottom))
	transition transform 0.3s steps(5)
	transform translate3d(0, 100%, 0)

	&.show
		transform translate3d(0, 0, 0)

.property
	&:not(:last-child)
		padding-bottom calc(1.5 * var(--nav-margin-horiz))

.name
	padding-bottom 10rem
	[lang=en]
		margin-left 0.5em
		font-size 12rem


.themes
	display flex
	gap var(--nav-margin-horiz)

	button
		position relative
		width 33rem
		height 33rem
		display block

	span
		font-size 33rem
		position absolute
		display block
		top 0
		left 0
		width 33rem
		height 33rem
		line-height 33rem
		text-align center
		text-shadow 0 0 1rem var(--theme-ink), 0 0 1rem var(--theme-ink), 0 0 1rem var(--theme-ink), 0 0 1rem var(--theme-ink), 0 0 1rem var(--theme-ink), 0 0 1rem var(--theme-ink), 0 0 1rem var(--theme-ink), 0 0 1rem var(--theme-ink), 0 0 1rem var(--theme-ink), 0 0 1rem var(--theme-ink), 0 0 1rem var(--theme-ink), 0 0 1rem var(--theme-ink), 0 0 1rem var(--theme-ink), 0 0 1rem var(--theme-ink), 0 0 1rem var(--theme-ink), 0 0 1rem var(--theme-ink), 0 0 1rem var(--theme-ink), 0 0 1rem var(--theme-ink), 0 0 1rem var(--theme-ink), 0 0 1rem var(--theme-ink), 0 0 1rem var(--theme-ink), 0 0 1rem var(--theme-ink), 0 0 1rem var(--theme-ink), 0 0 1rem var(--theme-ink), 0 0 1rem var(--theme-ink), 0 0 1rem var(--theme-ink), 0 0 1rem var(--theme-ink)
</style>
