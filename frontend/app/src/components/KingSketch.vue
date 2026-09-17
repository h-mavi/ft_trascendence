<script setup>
	/* Illustrazione a tono continuo (18k colori, alpha sui bordi strappati): non e'
	   vettorializzabile, quindi il componente resta un wrapper sul raster. Serve a
	   tenere il path dell'asset in un posto solo invece che in 4 view diverse.
	   L'import esplicito lascia che sia Vite a versionare l'URL in build. */
	import kingSketch from '@/assets/art/KingSketch.png';

	defineProps({
		alt: { type: String, default: '' }
	});
</script>

<template>
	<img :src="kingSketch" :alt="alt" :draggable="false">
</template>
