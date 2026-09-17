<script setup>
	import { computed, ref, watch, onUnmounted }	from 'vue'
	import IconClock 								from './icons/IconClock.vue';

	const props = defineProps({
		millis: { type: Number, default: 0 },
		go: { type: Boolean, default: false },
		active: { type: Boolean, default: false},
		team: {type: String, default: 'black'}
	})

	const	remaining	= ref(props.millis),
			totalSec	= computed(() => Math.ceil(remaining.value / 1000)),
			min			= computed(() => Math.floor(totalSec.value / 60)),
			sec			= computed(() => totalSec.value % 60);
	let		intervalId	= null,
			deadline	= 0;

	const TICK = 250;

	function tick() {
		remaining.value = Math.max(0, deadline - Date.now());
		if (remaining.value === 0)
			stopTimer();
	}

	function startTimer() {
		if (intervalId)
			return;
		deadline = Date.now() + remaining.value;
		intervalId = setInterval(tick, TICK);
	}

	function stopTimer() {
		if (!intervalId)
			return;
		clearInterval(intervalId);
		intervalId = null;
	}

	function pad(num) {
		if (num / 10 < 1) return "0" + num;
		else return num;
	}

	watch(() => props.millis, (val) => {
		remaining.value = val;
		if (intervalId)
		{
			stopTimer();
			startTimer();
		}
	});

	watch(() => props.go, (val) => {
		if (val)
			startTimer();
		else
			stopTimer();
	}, { immediate: true });

	onUnmounted(stopTimer);
</script>

<template>
	<div class="rounded-lg text-2xl mr-2 flex items-center gap-2 tabular-nums w-36 h-10 justify-center self-center p-2"
		style="font-weight: 700;"
		:class="{
			'opacity-50': !props.active,
			'bg-bg-darker text-white': props.team === 'black',
			'bg-[#ededed] text-black': props.team === 'white'
		}">
		<IconClock class="clock-icon" fill="currentColor" stroke="none" :paused="!props.go" />
		<p class="justify-self-center self-center">{{ pad(min) }} : {{ pad(sec) }}</p>
	</div>
</template>

<style scoped>

div {
    font-family: 'Inter Variable', sans-serif;
}

.clock-icon
{
	flex: 0 0 auto;
	font-size: .9em;
}

</style>