<script setup>
	import { ref, computed, watch, onMounted, onUnmounted }	from 'vue';
	import { ePlaying, matchMakingOpt, debug, localInfo,
			 eRoomType, eSide, saveMatchRequest,
			 loadMatchRequest }								from '@/scripts/Data/Variables.js';
	import { amIPlaying, fetchAiModels }					from '@/scripts/Events/BackLink';
	import { useAuthStore } 								from '@/stores/auth.st.js';
	import { useSockStore }									from '@/stores/sock.st';
	import { useRoute }										from 'vue-router'
	import { useI18n }          							from 'vue-i18n';
	import IconClockSolid									from '@/components/icons/IconClockSolid.vue';
	import IconSliders										from '@/components/icons/IconSliders.vue';
	import IconPlayers										from '@/components/icons/IconPlayers.vue';
	import IconPieces										from '@/components/icons/IconPieces.vue';
	import GameAllert										from '../components/GameAllert.vue';
	import IconRobot 										from '@/components/icons/IconRobot.vue';
	import router											from '@/router';
	import IconLogo                from '@/components/icons/IconLogo.vue';
    
    const { t } 		= useI18n();
	const sockStore 	= useSockStore();
	let	  alive			= true;

	const roomType  	= ref(null);
	const players   	= ref(null);
	const time      	= ref(null);
	const waiting   	= ref(false);
	const reloading 	= ref(false);
	const aiModel   	= ref(null);
	const side      	= ref(null);
	const aiModels		= ref([]);
	const route			= useRoute();
	const aiGame		= computed(() => route.query.ai === '1');
	const sides			= Object.values(eSide);
	const timeOptions	= ['15 min', '15 min', '15 min'];
	const timeEnabled	= computed(() => aiGame.value || roomType.value === 'PRIVATE');
	const choices		= { roomType, players, time, aiModel, side };

	const canPlay = computed(() => {
		if (aiGame.value)
			return (aiModel.value !== null && side.value !== null && time.value !== null);
		if (!roomType.value || !players.value)
			return (false);
		if (roomType.value === 'PRIVATE') 
			return (time.value !== null);
		return true;
	});

	watch(roomType, (val) => { 
		if (!aiGame.value && val !== 'PRIVATE') 
			time.value = null; 
	});

	watch(aiGame, async (isAi) => {
		if (!isAi || aiModels.value.length)
			return;
		aiModels.value = await fetchAiModels();
		
	}, { immediate: true });

	/**
	 * fONZIONCINA PER LANCIARE LE RICHIESTE DI MATCH, SI SLAVA LE RICHIESTE PASSATE
	 * PER IL GIOCA ANCORA
	 *
	 * @param	{string}	event		"find_match" o "create_ai_match"
	 * @param	{Object}	payload		Il payload da mandare con l'evento
	 * @returns	{void}
	 */
	function emitMatchRequest(event, payload)
	{
		localInfo.aiGame = event === 'create_ai_match';
		saveMatchRequest(event, payload);
		sockStore.socket.emit(event, payload);
		waiting.value = true;
	}

	function sendPlayRequest()
	{
		if (!sockStore.socket)
			return;

		if (aiGame.value)
		{
			const payload = { profile: aiModel.value };

			if (side.value !== eSide.RANDOM)
				payload.team = side.value;

			// { model: "stringa", time: "stringa", team: "stringa" }
			debug(useAuthStore().username, ` sfida il bot ${aiModel.value}!`);
			return (emitMatchRequest('create_ai_match', payload));
		}
		const options = new matchMakingOpt({
			matchType:		players.value,
			roomType:		eRoomType[roomType.value],
			matchSettings:	null
		})
		debug(useAuthStore().username, " ha appena richiesto un matchmaking!");
		emitMatchRequest('find_match', options);
	}

	/**
	 * Ricarica della richiesta di matchamking precedente per una nuova partita
	 * @returns	{void}
	 */
	function rematch()
	{
		const last = loadMatchRequest();

		router.replace({ query: { ...route.query, rematch: undefined } });
		if (!last || !sockStore.socket)
			return (debug("[playPage]: rivincita impossibile, richiesta o socket mancanti"));
		debug(useAuthStore().username, " chiede la rivincita!");
		emitMatchRequest(last.event, last.payload);
	}

	async function askAmIPlaying()
	{
		if (!sockStore.socket)
			return;

		const playing = await amIPlaying();

		if (!alive)
			return;

		if (playing === ePlaying.YES)
			router.push({ name: "game" });
		else
			debug("[playPage]: allora non sto already doing playing eh?");
	}

	function toggle(key, value) {
		const choice = choices[key];
		choice.value = choice.value === value ? null : value;
	}

	onMounted(() => {
		if (route.query.rematch === '1')
			rematch();
		askAmIPlaying();
	});
	onUnmounted(() => { alive = false });
</script>

<template>
	<GameAllert class="[@media(min-width:1520px)_and_(min-height:900px)]:hidden"/>

    <div class="max-[1520px]:hidden [@media(max-height:900px)]:hidden
			flex z-2 bg-bg-darker rounded-3xl">
        <div class="px-1 pb-16 flex flex-col items-center w-180">
    		<IconLogo class="size-35"/>
			<h1 class="text-[200%] mb-1 text-text-default justify-self-center whitespace-nowrap">{{ aiGame ? t('game.playPage.aiTitle') : t('game.playPage.title') }}</h1>
			<hr class="w-[80%] justify-self-center text-text-last">
			<div v-if="!waiting" >
				<div class="translate-y-9 w-full" :class="aiGame ? 'px-4' : 'pl-18'">
					<div class="flex flex-col gap-10">
						<div class="flex flex-row items-center">
							<IconRobot v-if="aiGame" class="size-12 mr-8 shrink-0 text-main-color"/>
							<IconSliders v-else		 class="size-12 mr-8 shrink-0 text-main-color"/>
							<div v-if="aiGame" class="grid grid-cols-3 gap-4 w-fit pr-4">
								<div v-for="(model, index) in aiModels" :key="model"
										@click="toggle('aiModel', model)"
										:class="[ aiModel === model ? 'border-main-color' : 'border-border-default',
    										    { 'col-start-2': index === aiModels.length - 1 } ]"
										class="opt opt-ai border-2 cursor-pointer">
									{{ model  === "GMU(Generale Matsuda Usushi)" ?  "Matsuda" : model}}
								</div>
							</div>
							<div v-else class="flex flex-row gap-4 flex-1 justify-center pr-30">
								<div class="opt border-2 border-border-default opacity-30 cursor-not-allowed">{{ t('game.playPage.opt.priv') }}</div>
								<div @click="toggle('roomType', 'FRIENDLY')" :class="roomType === 'FRIENDLY' ? 'border-main-color' : 'border-border-default'" class="opt border-2 cursor-pointer">{{ t('game.playPage.opt.friend') }}</div>
								<div @click="toggle('roomType', 'RANKED')"   :class="roomType === 'RANKED'   ? 'border-main-color' : 'border-border-default'" class="opt border-2 cursor-pointer">{{ t('game.playPage.opt.rank') }}</div>
							</div>
						</div>
						<div class="flex flex-row items-center">
							<IconPieces  v-if="aiGame" class="size-12 mr-8 shrink-0 text-main-color"/>
							<IconPlayers v-else        class="size-12 mr-8 shrink-0 text-main-color"/>
							<div v-if="aiGame" class="flex flex-row gap-4 flex-1 justify-start pr-4">
								<div v-for="s in sides" :key="s"
									 @click="toggle('side', s)"
									 :class="side === s ? 'border-main-color' : 'border-border-default'"
									 class="opt border-2 cursor-pointer">{{ t(`game.playPage.ai.side.${s}`) }}</div>
							</div>
							<div v-else class="flex flex-row gap-4 flex-1 justify-center pr-30">
								<div @click="players = players === '1v1'     ? null : '1v1'"     :class="players === '1v1'     ? 'border-main-color' : 'border-border-default'" class="opt border-2 cursor-pointer">1v1</div>
								<div @click="players = players === '2v2'     ? null : '2v2'"     class="opt border-2 border-border-default opacity-30 cursor-not-allowed">2v2</div>
								<div @click="players = players === '1v1v1v1' ? null : '1v1v1v1'" class="opt border-2 border-border-default opacity-30 cursor-not-allowed">FreeForAll</div>
							</div>
						</div>
						<div class="flex flex-row items-center">
							<IconClockSolid class="size-12 mr-8 shrink-0 text-main-color"/>
							<div class="flex flex-row gap-4 flex-1" :class="aiGame ? 'justify-start pr-4' : 'justify-center pr-30'">
								<div v-for="opt in timeOptions" :key="opt"
									 @click="timeEnabled && toggle('time', opt)"
									 :class="timeEnabled ? (time === opt ? 'border-main-color cursor-pointer' : 'border-border-default cursor-pointer') : 'border-border-default opacity-30 cursor-not-allowed'"
									 class="opt border-2 transition-all">{{ opt }}</div>
							</div>
						</div>
					</div>
				</div>
				<div class="flex justify-center mt-20">
					<button @click="sendPlayRequest()"
							:disabled="!canPlay"
							:class="canPlay ? 'pointer-events-auto grayscale-0' : 'pointer-events-none grayscale'"
							class=	"py-4 px-12 text-3xl text-text-default rounded-2xl transition-all duration-150
									bg-main-color hover:bg-linear-to-t from-main-color to-light-button cursor-pointer">
						{{ t('game.playPage.play') }}
					</button>
				</div>
			</div>
			<div v-else class="flex flex-col items-center justify-center gap-6 py-20">
				<div class="w-16 h-16 border-4 border-main-color border-t-transparent rounded-full animate-spin"></div>
				<p v-if="!reloading" class="text-text-default text-xl tracking-wide">
					{{ aiGame ? t('game.playPage.ai.side.looking') : t('game.playPage.opt.looking') }}<span class="dot dot-1">.</span><span class="dot dot-2">.</span><span class="dot dot-3">.</span>
				</p>
				<p v-else class="text-text-default text-xl tracking-wide">
					{{ t('game.playPage.reload') }}<span class="dot dot-1">.</span><span class="dot dot-2">.</span><span class="dot dot-3">.</span>
				</p>
				<button @click="waiting = false; sockStore.socket?.emit('cancel_match')"
						class="cursor-pointer justify-self-center w-[70%] my-3 p-3 text-base bg-main-color rounded-[7px] text-text-default hover:bg-linear-to-t from-main-color to-light-button">
						{{ t('game.playPage.cancel') }}
				</button>
			</div>
    	</div>
    </div>
</template>

<style scoped>
    h1, h4 { font-family: "Copperplate", Times; }

	@keyframes dot{
		0%, 100%	{ opacity: 0; }
		50%			{ opacity: 1; }
	}

	.dot	{ opacity: 0; animation: dot 1.5s infinite; }
	.dot-1	{ animation-delay: 0s; }
	.dot-2	{ animation-delay: 0.5s; }
	.dot-3	{ animation-delay: 1s; }

	.opt {
		border-radius: 8px;
		padding-block: 8px;
		color: var(--color-text-default);
		font-size: small;
		width: 96px;
		text-align: center;
	}

	.opt-ai { width: auto; min-width: 96px; padding-inline: 10px; }

	.opt:hover { background: var(--color-border-default); }
</style>