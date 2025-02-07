<script setup lang="ts">
import {computed} from 'vue'

const props = defineProps<{
	modelValue: number
	mode: 'time' | 'px'
}>()

const timecode = computed(() => {
	if (props.mode === 'time') {
		const sec = Math.floor(props.modelValue) % 60
		const min = Math.floor(props.modelValue / 60)

		return `${min.toString().padStart(1, '0')}:${sec.toString().padStart(2, '0')}`
	} else {
		return Math.round(props.modelValue).toString().padStart(5, ' ') + 'px'
	}
})
</script>

<template>
	<pre class="Timecode" :class="{px: props.mode === 'px'}">{{ timecode }}</pre>
</template>

<style scoped lang="stylus">
.Timecode
	font-family monospace
	font-size 14rem
	text-align right

	&.px
		width 5em
</style>
