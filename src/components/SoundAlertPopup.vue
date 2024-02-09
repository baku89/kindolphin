<template>
	<div class="SoundAlertPopup">
		<div class="fa sound-sprite img" />
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
	pointer-events none
	background-size 8px 8px
	background-position 0 0
	background-repeat repeat
	background-image url('data:image/webp;base64,UklGRoAAAABXRUJQVlA4IHQAAADQBACdASoQABAAAgA0JaQAMwB+AGeA/ACRAvwD+AaoF+AflV04H6AeoAcjt/SAYAD+9VQXCPdR6PB/+0hzhB36PvHgfjBHuo9F69tpDnCDv0bv/lrXvTHcdqeB+MEe6j0G73rkqn+ZqRp/yLI8uEHfn4AAAA==')

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
		transform scale(0)

	&.v-leave-active
		transition transform 0.3s steps(5)

.sound-sprite
	width 36rem
	height 36rem
</style>
