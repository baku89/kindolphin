<script setup lang="ts">
import {useAppSettingsStore} from '@/store/appSettings'

const settings = useAppSettingsStore()
</script>

<template>
	<div
		class="PaneSettings__outside"
		v-if="settings.show"
		@click="settings.show = !settings.show"
	></div>
	<div class="PaneSettings" ref="$root" :class="{show: settings.show}">
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
						:style="{color: theme.invert ? 'black' : theme.bg}"
					/>
				</button>
			</div>
		</section>
	</div>
</template>

<style lang="stylus" scoped>
.PaneSettings__outside
	position fixed
	inset 0
	z-index 99
	background black
	background-image url('data:image/webp;base64,UklGRlIAAABXRUJQVlA4WAoAAAAQAAAABwAABwAAQUxQSBMAAAABDzD/ERFCIJBQ5jTLxBH9jywDAFZQOCAYAAAAMAEAnQEqCAAIAAIANCWkAANwAP77lAAA')
	background-size 8rem 8rem

	mix-blend-mode lighten
	filter invert(1)

	.invert &
		filter invert(0)
		mix-blend-mode darken

.PaneSettings
	position fixed
	bottom 0
	left -1rem
	right -1rem
	border 1rem solid var(--color-ink)
	background var(--color-bg)
	border-radius 20rem 20rem 0 0
	z-index 100
	font-size 16rem
	padding calc(2 * var(--nav-margin-horiz))
	transition transform 0.3s steps(5)
	transform translate3d(0, 100%, 0)

	.invert &
		--color-ink white
		color white
		background black


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
		text-shadow 0 0 1px var(--color-ink), 0 0 1px var(--color-ink), 0 0 1px var(--color-ink), 0 0 1px var(--color-ink), 0 0 1px var(--color-ink), 0 0 1px var(--color-ink), 0 0 1px var(--color-ink), 0 0 1px var(--color-ink), 0 0 1px var(--color-ink), 0 0 1px var(--color-ink), 0 0 1px var(--color-ink), 0 0 1px var(--color-ink), 0 0 1px var(--color-ink), 0 0 1px var(--color-ink), 0 0 1px var(--color-ink), 0 0 1px var(--color-ink), 0 0 1px var(--color-ink), 0 0 1px var(--color-ink), 0 0 1px var(--color-ink), 0 0 1px var(--color-ink), 0 0 1px var(--color-ink), 0 0 1px var(--color-ink), 0 0 1px var(--color-ink), 0 0 1px var(--color-ink), 0 0 1px var(--color-ink), 0 0 1px var(--color-ink), 0 0 1px var(--color-ink)
</style>
