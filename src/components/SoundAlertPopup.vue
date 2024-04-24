<script setup lang="ts">
import {useUIStore} from '@/store/ui'

const ui = useUIStore()
</script>

<template>
	<div class="SoundAlertPopup">
		<div class="fa sound-sprite img" />
		<div class="text">{{ ui.label.soundAlert }}</div>
	</div>
</template>

<style scoped lang="stylus">
.SoundAlertPopup
	--size 100rem
	position fixed
	z-index 10
	width var(--size)
	height var(--size)
	top calc(50% - var(--size) / 2)
	left calc(50% - var(--size) / 2)
	background var(--white)
	border-radius 10rem
	border 1px solid black
	pointer-events none
	background-size 8px 8px
	background-position 0 0
	background-repeat repeat
	background-image url('data:image/webp;base64,UklGRnIAAABXRUJQVlA4IGYAAABwBACdASoQABAAAgA0JaTuHJ88/8QC/APsA///8A6gH//8wD///wD+AAAtgAD83wZdSvPCjHBRT9Z7kLWcp9rHB4aOvJkFan63NB4aOvJkFan64+FPtApnMsU55CRmcfMMsfPwAAA=')

	font-size 14rem
	text-align center
	display flex
	flex-direction column
	justify-content center
	align-items center

	html.invert &
		filter invert(100%)

	&.v-enter-from
	&.v-leave-to
		transform scale(0.5)
		top 0
		left 90%

	&.v-leave-active
		transition all 0.6s steps(10)

.sound-sprite
	width 36rem
	height 36rem

.text
	font-size 80%
	font-weight bold
	margin-top 5rem
	text-shadow 0 1px 1px var(--white), 1px 0 1px var(--white), 0 -1px 1px var(--white), -1px 0 1px var(--white)
</style>
