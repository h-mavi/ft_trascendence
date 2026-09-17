<script setup>
	import { useId } from 'vue';

	// doppio chevron: contorno arancio + riempimento con sfumatura ambra
	defineProps({
		outline:	{ type: String, default: '#f59e0b' },	// bordo esterno
		from:		{ type: String, default: '#fbbf24' },	// inizio sfumatura
		to:			{ type: String, default: '#fde047' }	// fine sfumatura
	});

	const gradId = useId();
</script>

<template>
	<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"
		fill="none" aria-hidden="true" focusable="false">
		<defs>
			<linearGradient :id="gradId" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" :stop-color="from"/>
				<stop offset="50%" :stop-color="to"/>
				<stop offset="100%" :stop-color="from"/>
			</linearGradient>
		</defs>
		<g stroke-linecap="round" stroke-linejoin="round">
			<path d="M4.5 4.5 11 12l-6.5 7.5M12.5 4.5 19 12l-6.5 7.5"
				:stroke="outline" stroke-width="5.4"/>
			<path d="M4.5 4.5 11 12l-6.5 7.5M12.5 4.5 19 12l-6.5 7.5"
				:stroke="`url(#${gradId})`" stroke-width="3.4"/>
		</g>
	</svg>
</template>
