<script setup>
	defineProps({
		stroke:      { type: String, default: 'currentColor' },
		strokeWidth: { type: [String, Number], default: '2.5' }
	});
</script>

<template>
	<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 24 24"
		:stroke-width="strokeWidth" :stroke="stroke" aria-hidden="true" focusable="false">
		<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
	</svg>
</template>
