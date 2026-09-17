<script setup>
	defineProps({
		fill: { type: String, default: '#70777F' },
		bg:   { type: String, default: '#D9DCE1' }
	});
</script>

<template>
	<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 350 350"
		aria-hidden="true" focusable="false">
		<rect width="350" height="350" :fill="bg" />
		<ellipse cx="174.5" cy="155.5" rx="54.5" ry="60.5" :fill="fill" />
		<circle cx="174.5" cy="346.5" r="111.5" :fill="fill" />
	</svg>
</template>
