<script setup>
	defineProps({
		fill: { type: String, default: 'currentColor' }
	});
</script>

<template>
	<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"
		:fill="fill" aria-hidden="true" focusable="false">
		<path fill-rule="evenodd" d="M11.25 3a.75.75 0 0 1 1.5 0v1.06a3.75 3.75 0 0 1 2.03 5.878l1.2 1.68a.75.75 0 0 1-.61 1.186H8.63a.75.75 0 0 1-.61-1.186l1.2-1.68A3.75 3.75 0 0 1 11.25 4.06V3Zm-3 11.304h7.5l.72 3.446H7.53l.72-3.446ZM5.25 19.25h13.5a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75H5.25a.75.75 0 0 1-.75-.75V20a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd" />
	</svg>
</template>
