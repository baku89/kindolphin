<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from 'vue'

const show = ref(false)

onMounted(() => {
	show.value = true
})

onBeforeUnmount(() => {
	show.value = false
})
</script>

<template>
	<Transition>
		<div class="FadeBg" v-show="show" />
	</Transition>
</template>

<style lang="stylus" scoped>
.FadeBg
	mix-blend-mode lighten

	&:before
	&:after
		content ''
		position absolute
		inset 0

	// dither
	&:before
		background-size 8px 8px
		background-position 0 0
		background-repeat repeat
		background-image url('data:image/webp;base64,UklGRnIAAABXRUJQVlA4IGYAAABwBACdASoQABAAAgA0JaTuHJ88/8QC/APsA///8A6gH//8wD///wD+AAAtgAD83wZdSvPCjHBRT9Z7kLWcp9rHB4aOvJkFan63NB4aOvJkFan64+FPtApnMsU55CRmcfMMsfPwAAA=')


	// overlay
	&:after
		content ''
		position absolute
		inset 0
		background var(--theme-bg)
		mix-blend-mode darken

	html.invert &
		mix-blend-mode darken

		&:before
			filter invert(1)

		&:after
			mix-blend-mode lighten

	&.v-enter-active
		animation dummy 0.3s
		&:before
			animation dither 0.3s

	&.v-leave-active
		animation dummy 0.3s reverse
		&:before
			animation dither 0.3s reverse

@keyframes dummy
	0%
		opacity 1
	100%
		opacity 1

@keyframes dither
	0%
		background-image url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=')
	19%
		background-image url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=')
	20%
		background-image url('data:image/webp;base64,UklGRp4AAABXRUJQVlA4IJIAAABQBACdASoQABAAAgA0JaQAMgAzwEaAcIB5gX4Bymf9w9QAzYJLddRJmdeuAP7+oEb/xA4DFX4N1Q7nT/xA4DFX4N1Q8edTvxf56Ft96BdQ/h4m4TBpzl12D2iY7kf/FBef6StZNaihmKDtWDdf+RQhejyKJ7o/SdsuhzW/z0Lb70C6h/DxNwmIr/Dpmf1WcfEEAA==')
	39%
		background-image url('data:image/webp;base64,UklGRp4AAABXRUJQVlA4IJIAAABQBACdASoQABAAAgA0JaQAMgAzwEaAcIB5gX4Bymf9w9QAzYJLddRJmdeuAP7+oEb/xA4DFX4N1Q7nT/xA4DFX4N1Q8edTvxf56Ft96BdQ/h4m4TBpzl12D2iY7kf/FBef6StZNaihmKDtWDdf+RQhejyKJ7o/SdsuhzW/z0Lb70C6h/DxNwmIr/Dpmf1WcfEEAA==')
	40%
		background-image url('data:image/webp;base64,UklGRrYAAABXRUJQVlA4IKoAAAAQBQCdASoQABAAAgA0JaQATgDkAvQCYAfi681XzAvwD8segw/p/qAGbBJKqfTnzyAAAP7+oEb/wzwuD/m2+l9nf/lzxu//Nt9L9jj3L//PWAf0jhuCndBJEStSSJeX/MQQ91tPcXzuqDShGhyFAFAH/igcp/z40c7BMV0eF5Llaa7WsKq5/nrAP6Rw3BTugkiJWpJE2h/9L3iRkdM1jPPNTZK8ZEU5vNsAAA==')
	59%
		background-image url('data:image/webp;base64,UklGRrYAAABXRUJQVlA4IKoAAAAQBQCdASoQABAAAgA0JaQATgDkAvQCYAfi681XzAvwD8segw/p/qAGbBJKqfTnzyAAAP7+oEb/wzwuD/m2+l9nf/lzxu//Nt9L9jj3L//PWAf0jhuCndBJEStSSJeX/MQQ91tPcXzuqDShGhyFAFAH/igcp/z40c7BMV0eF5Llaa7WsKq5/nrAP6Rw3BTugkiJWpJE2h/9L3iRkdM1jPPNTZK8ZEU5vNsAAA==')
	60%
		background-image url('data:image/webp;base64,UklGRrQAAABXRUJQVlA4IKgAAADwBgCdASoQABAAAgA0JaQARAD8ANsA/ADeAPwA3gH4AZv+MAfwDVAvwD8qv3////ZY/wD+AeoB////+T75ZsEAAP734fC1CZ3lsEO2oTO8tgh21CZ3lsEO2oTO8tkfcBGokzSDYbam4FGNCSddTorCUPUY2R9cfS3wKmmPT/EIfJgPk+F62mK10eBuHFfkMlP69bTWczanDh/L/tR8XRcEjTy5o+QAAAA=')
	79%
		background-image url('data:image/webp;base64,UklGRrQAAABXRUJQVlA4IKgAAADwBgCdASoQABAAAgA0JaQARAD8ANsA/ADeAPwA3gH4AZv+MAfwDVAvwD8qv3////ZY/wD+AeoB////+T75ZsEAAP734fC1CZ3lsEO2oTO8tgh21CZ3lsEO2oTO8tkfcBGokzSDYbam4FGNCSddTorCUPUY2R9cfS3wKmmPT/EIfJgPk+F62mK10eBuHFfkMlP69bTWczanDh/L/tR8XRcEjTy5o+QAAAA=')
	80%
		background-image url('data:image/webp;base64,UklGRnIAAABXRUJQVlA4IGYAAABwBACdASoQABAAAgA0JaTuHJ88/8QC/APsA///8A6gH//8wD///wD+AAAtgAD83wZdSvPCjHBRT9Z7kLWcp9rHB4aOvJkFan63NB4aOvJkFan64+FPtApnMsU55CRmcfMMsfPwAAA=')
</style>
