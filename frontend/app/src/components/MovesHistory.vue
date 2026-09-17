<script setup>
	import { mainAction, teamDot, turnDuration, turnLabel }	from "@/scripts/Helper/Historyutils.js"
	import { computed, nextTick, ref, watch }				from 'vue';
	import { localHistory }									from '@/scripts/Data/History';
	import { IMG_PATHS }									from '@/scripts/Data/Variables';
	import { useI18n }										from 'vue-i18n';
	
	//@ts-ignore
	const emit = defineEmits(['select']);
	const { t } = useI18n();
	const scroller = ref(null), 
					 lastTurn = computed(() => localHistory.length ? localHistory[localHistory.length - 1].turn : -1);
	const iconOf = (turn) => {
		const action = mainAction(turn);
		return (action?.piece ? IMG_PATHS[turn.team + action.piece] : null);
	};

	watch(() => localHistory.length, async () => {
		await nextTick();
		if (scroller.value)
			scroller.value.scrollTop = scroller.value.scrollHeight;
	});
</script>

<template>
	<div class="select-none flex flex-col overflow-hidden">
		<div ref="scroller" class="grow overflow-y-auto scroll-smooth">
			<p v-if="!localHistory.length" class="px-4 py-8 text-center text-white/35 text-sm">
				{{ t('game.ChessBoard.moveHistory') }}
			</p>

			<button v-for="t in localHistory" :key="t.turn"
					class="row" :class="{ 'is-last': t.turn === lastTurn}"
					:title="`turn ${t.turn} · ${turnDuration(t.time)}`"
					@click="emit('select', t)">

					<span class="num">{{ t.turn }}</span>
					<span class="dot" :style="{ backgroundColor: teamDot(t.team)}"/>
					<img v-if="iconOf(t)" :src="iconOf(t)" :draggable="false" class="size-5 shrink-0" alt="">
					<span class="truncate grow">{{  turnLabel(t) }}</span>
					<span class="time">{{ turnDuration(t.time) }}</span>
			</button>
		</div>
	</div>
</template>

<style scoped>
	.row
	{
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		padding: 7px 10px;
		color: var(--color-text-second);
		font-size: 0.9rem;
		text-align: left;
		transition: background-color .15s ease;
	}

	.row:nth-child(even)	{ background-color: rgba(255, 255, 255, .03); }
	.row:hover				{ background-color: rgba(255, 255, 255, .07); }
	.row.is-last			{ background-color: var(--color-bg-historyM); color: var(--color-text-error); }

	.num
	{
		width: 2.2rem;
		flex-shrink: 0;
		color: var(--color-text-third);
		font-size: 0.85rem;
	}

	.dot
	{
		width: 9px;
		height: 9px;
		flex-shrink: 0;
		border-radius: 50%;
		border: 1px solid rgba(0, 0, 0, .55);
	}

	.time
	{
		flex-shrink: 0;
		color: var(--color-text-third);
		font-size: 0.75rem;
	}

	h3 {font-family: "Copperplate", Times; }

</style>