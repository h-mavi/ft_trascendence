<script setup>
	defineProps({
		stroke:  { type: String,  default: 'currentColor' },
		slashed: { type: Boolean, default: false }
	});
</script>

<template>
	<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 24 24"
		stroke-width="1.5" :stroke="stroke" aria-hidden="true" focusable="false">
		<path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 8.155 7.36 5.5 12 5.5c4.638 0 8.573 2.655 9.963 6.428.07.207.07.431 0 .639C20.577 15.845 16.64 18.5 12 18.5c-4.638 0-8.573-2.655-9.963-6.428Z" />
		<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
		<path v-if="slashed" stroke-linecap="round" stroke-linejoin="round" d="M3 3 21 21" />
	</svg>
</template>
