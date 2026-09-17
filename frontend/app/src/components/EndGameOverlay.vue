<script setup>
	import { localInfo, startLocalMatchState,
			 loadMatchRequest }					from '@/scripts/Data/Variables';
	import { clearMatchStorage }				from '@/scripts/Data/Archi';
	import { computed, ref, watch }				from 'vue'
	import router								from '@/router';
	import IconCrown							from './icons/IconCrown.vue';
	import IconCrownBroken						from './icons/IconCrownBroken.vue';
	import IconKings							from './icons/IconKings.vue';
	import { playAudio } 						from '@/scripts/Helper/generalUtils';

	const dismissed = ref(false);
	//la rivincita ha senso solo se PlayPage ha salvato una richiesta da rifare
	const canRematch = loadMatchRequest() !== null;

	const victory = computed(() => localInfo.victory);
	const outcome = computed(() => {
		if (!victory.value)
			return null;
		if (victory.value === 'draw')
			return 'draw';
		return (victory.value === localInfo.myTeam ? 'win' : 'lose');
	});

	const showOverlay = computed(() => outcome.value !== null && !dismissed.value);
	const showReopen = computed(() => outcome.value !== null && dismissed.value);

	const content = computed(() => ({
		win: { icon: IconCrown, title: 'You Win!', cls:'text-text-win-open'},
		lose: { icon: IconCrownBroken, title: 'You Lose!', cls:'text-text-lose-closed'},
		draw: { icon: IconKings, title: 'Draw!', cls:'text-text-draw-await'},
	}[outcome.value] ?? { icon: null, title: '', cls: ''}));

	watch(victory, (v) => {
		if (v) 
			return;
		dismissed.value = false;
		clearMatchStorage()
	});

	function leaveMatch() {
		clearMatchStorage();
		localInfo.victory = null;
		localInfo.aiGame = false;
		startLocalMatchState(null);
	}

	/**
	 * Torna alla PlayPage, nella variante bot se la partita era contro l'ai.
	 * con la flag rematch a true fa un'altra richiesta di match uguale alla scorsa automaticamente
	 *
	 * @param	{boolean}	rematch		Se rifare subito l'ultima richiesta di partita
	 * @returns	{void}
	 */
	function playAgain(rematch = false)
	{
		const query = {};

		if (localInfo.aiGame === true)
			query.ai = '1';
		if (rematch)
			query.rematch = '1';
		leaveMatch();
		router.replace({ name: 'playpage', query });
	}
	function goHome() { leaveMatch(); router.push({name: 'home'}); }
	function watchBoard() { dismissed.value = true; }
	function reopen() { dismissed.value = false; }

	//NOTE - stesso schema di ActionButtons: un listener in capture copre tutti i bottoni
	//del popup, e il bottone di riapertura se lo mette da se' perche' sta fuori dall'overlay.
	function tap(event)
	{
		if (event.target?.closest?.("button"))
			playAudio("tap");
	}
</script>

<template>
	<div v-if="showOverlay" @click.capture="tap"
		class="absolute inset-0 z-20 flex flex-col items-center justify-center
			gap-6 backdrop-blur-sm bg-black/50 select-none">
		<component :is="content.icon" v-if="content.icon" :class="content.cls" class="w-40 h-40 drop-shadow-xl"/>
		<h2 class="text-3xl font-bold" :class="content.cls">{{ content.title }}</h2>

		<div class="flex flex-col gap-3 w-56">
			<button v-if="canRematch" @click="playAgain(true)"
					class="py-3 rounded-xl bg-main-color hover:bg-linear-to-t from-main-color to-light-button
						text-text-default font-bold transition hover:-translate-y-0.5">
				Rivincita
			</button>
			<!-- le parentesi servono: senza, Vue passa il MouseEvent come rematch e sarebbe sempre vero -->
			<button @click="playAgain()"
					class="py-3 rounded-xl bg-text-win-open hover:bg-[#02c04e] text-text-default font-bold
						transition hover:-translate-y-0.5">
				Gioca Ancora
			</button>
			<button @click="watchBoard"
					class="py-3 rounded-xl bg-sky-700 hover:bg-[#0074bd] text-text-default font-bold
						transition hover:-translate-y-0.5">
				Guarda la Scacchiera
			</button>
			<button @click="goHome"
					class="py-3 rounded-xl bg-neutral-600 hover:bg-neutral-500 text-text-default font-bold
						transition hover:-translate-y-0.5">
				Torna alla Home
			</button>
		</div>
	</div>

	<button v-if="showReopen" @click.capture="tap" @click="reopen"
			class="absolute top-2 right-2 z-20 px-3 py-2 rounded-lg text-sm font-bold
				bg-black/60 text-text-default hover:bg-black/80 transition select-none">
		Fine Partita ↩
	</button>
</template>