<script setup lang="ts">
import {useAppSettingsStore} from '@/store/appSettings'

defineProps<{
	show: boolean
}>()

defineEmits<{
	'update:show': [value: boolean]
}>()

const settings = useAppSettingsStore()
</script>

<template>
	<div
		class="PaneSettings__outside"
		v-if="show"
		@click="$emit('update:show', false)"
	/>
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
.PaneSettings__outside
	position fixed
	inset 0
	z-index 99
	background var(--theme-bg)
	mask-image url('data:image/webp;base64,UklGRlQDAABXRUJQVlA4WAoAAAAEAAAABwAABwAAVlA4TBwAAAAvB8ABAA8w//M///MfeBAIJP5MO62QRkT/Y1kAWE1QIBIDAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA5LjEtYzAwMiA3OS5mMzU0ZWZjNzAsIDIwMjMvMTEvMDktMTI6MDU6NTMgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCAyNS40IChNYWNpbnRvc2gpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkNDNUZEOUZEQjk5QTExRUU5OEI1QkFCNzYxQUE1MUQ4IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkNDNUZEOUZFQjk5QTExRUU5OEI1QkFCNzYxQUE1MUQ4Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6Q0M1RkQ5RkJCOTlBMTFFRTk4QjVCQUI3NjFBQTUxRDgiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6Q0M1RkQ5RkNCOTlBMTFFRTk4QjVCQUI3NjFBQTUxRDgiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4=')
	mask-mode luminance
	mask-size 8rem 8rem
	image-rendering pixelated

	.overlay
		position absolute
		inset 0
		background var(--theme-bg)
		mix-blend-mode darken

		body.invert &
			mix-blend-mode lighten

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
	padding calc(2 * var(--nav-margin-horiz))
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
