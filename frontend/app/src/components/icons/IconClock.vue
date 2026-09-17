<script setup>
	import { computed } from 'vue';

	const props = defineProps({
		fill:		{ type: String, default: '#006aff' },
		stroke:		{ type: String, default: '#000000' },
		hourDur:	{ type: [String, Number], default: '15s' },
		minuteDur:	{ type: [String, Number], default: '2s' },
		paused:		{ type: Boolean, default: false }
	});

	const asDur		= (v) => (typeof v === 'number' ? `${v}s` : v);
	const hour		= computed(() => asDur(props.hourDur));
	const minute	= computed(() => asDur(props.minuteDur));
</script>

<template>
	<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"
		:fill="fill" :stroke="stroke" aria-hidden="true" focusable="false"
		:class="{ 'is-paused': paused }"
		:style="{ '--hour-dur': hour, '--minute-dur': minute }">
		<path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,20a9,9,0,1,1,9-9A9,9,0,0,1,12,21Z"/>
		<rect class="hand hour" width="2" height="7" x="11" y="6" rx="1"/>
		<rect class="hand minute" width="2" height="9" x="11" y="11" rx="1"/>
	</svg>
</template>

<style scoped>
	.hand
	{
		transform-box: view-box;
		transform-origin: 12px 12px;
		animation-name: clock-spin;
		animation-timing-function: linear;
		animation-iteration-count: infinite;
	}

	.hour	{ animation-duration: var(--hour-dur, 9s); }
	.minute	{ animation-duration: var(--minute-dur, .75s); }

	svg.is-paused .hand { animation-play-state: paused; }

	@keyframes clock-spin { to { transform: rotate(360deg); } }
</style>
