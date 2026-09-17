<script setup>
	defineProps({
		stroke: { type: String, default: 'currentColor' }
	});
</script>

<template>
	<!-- Geometria ricavata dai pixel del vecchio search.png: cerchio con raggio di
	     mezzeria 181.5 e manico sulla diagonale, entrambi con tratto 42 su 512. -->
	<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512"
		fill="none" :stroke="stroke" stroke-width="42" stroke-linecap="round"
		aria-hidden="true" focusable="false">
		<circle cx="202.5" cy="202.5" r="181.5" />
		<path d="M330 330 500 500" />
	</svg>
</template>
