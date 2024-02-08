<script setup lang="ts">
defineProps<{
	icon: string
	label: string
	href?: string
}>()
</script>

<template>
	<component :is="href ? 'a' : 'button'" class="FooterButton" :href="href">
		<img class="fa" :src="icon" />
		<span class="label">{{ label.toUpperCase() }}</span>
	</component>
</template>

<style scoped lang="stylus">
.FooterButton
	display flex
	flex-direction column
	align-items center
	justify-content center
	gap 3rem

.label
	font-size 9em
	font-family var(--font-small)
	letter-spacing 0.05em
	height 9rem
	line-height 9rem

.fa
	display block
	font-size 20rem
	height 25rem
	width 25rem
	text-align center
</style>
