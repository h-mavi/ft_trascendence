<script setup>
	import { useId } from 'vue';

	// chevron pieno: sagoma gialla con contorno arancio
	defineProps({
		outline:	{ type: String, default: '#f97316' },	// bordo esterno
		from:		{ type: String, default: '#ffe100' },	// inizio sfumatura
		to:			{ type: String, default: '#ffc400' }	// fine sfumatura
	});

	const gradId = useId();
</script>

<template>
	<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"
		aria-hidden="true" focusable="false">
		<defs>
			<linearGradient :id="gradId" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" :stop-color="from"/>
				<stop offset="100%" :stop-color="to"/>
			</linearGradient>
		</defs>
		<path d="M3 3.6h11.7L21.4 12l-6.7 8.4H3l6.2-8.4z"
			:fill="`url(#${gradId})`" :stroke="outline"
			stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
	</svg>
</template>
