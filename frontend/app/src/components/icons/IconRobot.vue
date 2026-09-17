<script setup>
	defineProps({
		fill: { type: String, default: 'currentColor' }
	});
</script>

<template>
	<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"
		:fill="fill" aria-hidden="true" focusable="false">
		<path fill-rule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v1.5h2.25a3 3 0 0 1 3 3v1.5h1.5a.75.75 0 0 1 0 1.5h-1.5v3h1.5a.75.75 0 0 1 0 1.5h-1.5v.75a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V15H4.5a.75.75 0 0 1 0-1.5H6v-3H4.5a.75.75 0 0 1 0-1.5H6v-1.5a3 3 0 0 1 3-3h2.25V3a.75.75 0 0 1 .75-.75Zm-2.25 7.5a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Zm4.5 0a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM9 15.75a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd" />
	</svg>
</template>
