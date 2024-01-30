<script setup lang="ts">
defineProps<{
	modelValue: boolean | null
}>()

defineEmits<{
	'update:modelValue': [value: boolean]
}>()
</script>

<template>
	<div class="SoundAlert">
		<div class="alert">
			<div class="prompt">
				<i class="fa fa-sharp fa-solid fa-music" />
				<div class="message">
					<span lang="en">Dou you want to enable the music?</span><br />
					<span>音を出しますか？</span>
				</div>
			</div>

			<div class="buttons">
				<button @click="$emit('update:modelValue', true)">
					はい (<u>Y</u>)
				</button>
				<button @click="$emit('update:modelValue', false)">
					いいえ (<u>N</u>)
				</button>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.SoundAlert
	position fixed
	inset 0
	background rgba(0, 0, 0, 0.5)
	z-index 100
	display flex
	justify-content center
	align-items center

.alert
	width fit-content
	max-width 90vw
	background var(--color-bg)
	text-align center
	font-size "min(5vw, 40px)" % null
	border var(--px) solid var(--color-ink)

	i
		font-size 1.5em
		vertical-align middle
		margin-right 0.5em

.prompt
	padding 1.5em 1em 1.5em

.message
	display inline-block
	vertical-align middle
	text-align left
	line-height 1.2em

	[lang=en]
		font-size 0.8em

.buttons
	position relative
	font-size 0.8em
	color var(--color-ink)
	display grid
	grid-template-columns 1fr 1fr
	gap 0.3em
	padding 0 0.3em 0.3em

	button
		box-sizing content-box
		height 3em
		line-height 3em
		background var(--color-bg)
		color var(--color-ink)
		border var(--px) solid var(--color-ink)

		&:hover
			color var(--color-bg)
			background var(--color-ink)
</style>
