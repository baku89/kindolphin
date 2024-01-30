<script setup lang="ts">
import {computed} from 'vue'

const props = defineProps<{
	modelValue: number
}>()

const timecode = computed(() => {
	const sec = Math.floor(props.modelValue) % 60
	const min = Math.floor(props.modelValue / 60)

	return `${min.toString().padStart(1, '0')}:${sec.toString().padStart(2, '0')}`
})
</script>

<template>
	<div class="Timecode">
		{{ timecode }}
	</div>
</template>
