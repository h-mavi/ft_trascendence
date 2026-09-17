<script setup>
	import { ref, watch }	from 'vue';
	import IconDefault		from './icons/IconDefault.vue';

	/* Le radici del template sono due (img / IconDefault), quindi Vue non sa su
	   quale applicare da solo gli attributi passati dall'esterno: li disattivo e
	   li ridistribuisco a mano con v-bind="$attrs" su entrambi i rami. */
	defineOptions({ inheritAttrs: false });

	const props = defineProps({
		src: { type: String, default: null },
		alt: { type: String, default: 'avatar' }
	});

	/* Se l'URL esiste ma il caricamento fallisce (404, link rotto lato server),
	   ripieghiamo sul placeholder. Il watch resetta il flag quando cambia src,
	   altrimenti un errore vecchio bloccherebbe per sempre l'immagine nuova. */
	const failed = ref(false);
	watch(() => props.src, () => { failed.value = false; });
</script>

<template>
	<img v-if="src && !failed" v-bind="$attrs" :src="src" :alt="alt"
		:draggable="false" @error="failed = true">
	<IconDefault v-else v-bind="$attrs" class="overflow-hidden" />
</template>
