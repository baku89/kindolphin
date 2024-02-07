<script setup lang="ts">
import {range} from 'lodash'
import {computed} from 'vue'

const props = withDefaults(
	defineProps<{
		progress: number
		total: number
		count: number
	}>(),
	{
		count: 14,
	}
)

const filledCount = computed(() => {
	return Math.floor((props.progress / props.total) * props.count)
})
</script>

<template>
	<div class="CircleProgress">
		<i
			class="fa fa-sharp fa-circle"
			v-for="i in range(props.count)"
			:key="i"
			:class="[i < filledCount ? 'fa-solid' : 'fa-regular']"
		/>
	</div>
</template>
