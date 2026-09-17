<script setup>
	import { computed, ref, onMounted, watch } from 'vue';

const props = defineProps({
		variant:	{ type: String, default: 'yellow' },
		speed:		{ type: Number, default: .45 },
		hue:		{ type: Number, default: 0 },
		glow:		{ type: Number, default: 1 }
	});

	const files = import.meta.glob('../assets/aura/aura-*.{webm,gif}', { eager: true, query: '?url', import: 'default' });

	const source = computed(() =>
	{
		const webm = files[`../assets/aura/aura-${props.variant}.webm`];

		if (webm)
			return { url: webm, video: true };

		const gif = files[`../assets/aura/aura-${props.variant}.gif`];

		return gif ? { url: gif, video: false } : null;
	});

	const player = ref(null);

	// playbackRate va riapplicato a ogni cambio di sorgente: alcuni browser lo azzerano.
	const applySpeed = () =>
	{
		if (player.value)
			player.value.playbackRate = props.speed;
	};

	onMounted(() =>
	{
		applySpeed();
		if (player.value && matchMedia('(prefers-reduced-motion: reduce)').matches)
			player.value.pause();
	});

	watch(() => [props.speed, source.value], applySpeed);
</script>

<template>
	<video v-if="source?.video" ref="player" class="aura" :src="source.url"
		autoplay loop muted playsinline disablepictureinpicture
		aria-hidden="true" @loadeddata="applySpeed"
		:style="{ filter: `hue-rotate(${hue}deg)`, opacity: glow }"/>
</template>

<style scoped>
	:where(.aura)
	{
		width: 100%;
		height: 100%;
	}

	.aura
	{
		display: block;
		object-fit: contain;
		pointer-events: none;
		user-select: none;
	}

</style>
