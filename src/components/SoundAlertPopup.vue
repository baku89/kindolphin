<script setup lang="ts">
import {computed} from 'vue'

import {useAppSettingsStore} from '@/store/appSettings'
import {useUIStore} from '@/store/ui'

const ui = useUIStore()
const settings = useAppSettingsStore()

const label = computed(() => {
	return settings.muted ? ui.label.soundAlertMuted : ui.label.soundAlert
})
</script>

<template>
	<div class="SoundAlertPopup">
		<div class="wrapper">
			<div class="fa sound-sprite img" :class="{muted: settings.muted}" />
			<div class="text">{{ label }}</div>
		</div>
	</div>
</template>

<style scoped lang="stylus">
.SoundAlertPopup
	--w 200rem
	position fixed
	z-index 10
	width var(--w)
	aspect-ratio 340 / 150
	top calc(var(--header-height) / 2)
	right calc(var(--nav-margin-horiz))
	pointer-events none
	background-size 100% 100%
	background-position 0 0
	background-repeat repeat
	background-image url('/assets/alert.webp')
	transform-origin 87% 0

	&.v-enter-from
	&.v-leave-to
		transform scale(0)

	&.v-leave-active
	&.v-enter-active
		transition all 0.5s steps(6)

	html.invert &
		filter invert(100%)

.wrapper
	position absolute
	top 35%
	left 10%
	right 5%
	bottom 15%
	font-size 14rem
	text-align center
	display flex
	flex-direction row
	justify-content center
	gap 8rem
	align-items center

.sound-sprite
	width 36rem
	height 36rem

	&.muted
		background-position 0 100%

.text
	font-weight bold
</style>
