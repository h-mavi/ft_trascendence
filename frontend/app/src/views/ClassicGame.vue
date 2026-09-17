<script setup>
	import { localMatchState, localInfo, DOMPlayer, ePlaying, debug }	from '@/scripts/Data/Variables';
	import { onMounted, ref, computed, onUnmounted, watch }       		from 'vue';
	import { reloadMatch, amIPlaying, requestToBack }					from '@/scripts/Events/BackLink.js';
	import PlayerInfo               									from '../components/PlayerInfo.vue';
	import ChessBoard               									from '../components/ChessBoard.vue';
	import ActionButtons												from '../components/ActionButtons.vue';
	import EndGameOverlay 												from '@/components/EndGameOverlay.vue';
	import { clearMatchStorage }										from '@/scripts/Data/Archi.js';
	import router 														from '@/router';
	import MovesHistory													from '@/components/MovesHistory.vue';
	import KingsCodex													from '@/components/KingsCodex.vue';
	import ChatBox														from '@/components/ChatBox.vue';

	const	ready		= ref(false);
	const	style		= ref("1v1");
	const	bottomP		= computed(() => DOMPlayer(2)?.team === localInfo.myTeam ? 2 : 1);
	const	topP		= computed(() => bottomP.value === 1 ? 2: 1);
	let		alive		= true;

	onMounted(async () => {
		debug("[ClassicGame]: OnMounted");		
		try{
			if (!localMatchState)
			{
				const playing = await amIPlaying();

				if (!alive)
					return;

				if (localMatchState)
				{
					ready.value = true;
					return;
				}

				if (playing === ePlaying.NO)
				{
					debug("[ClassicGame]: non sono in partita, reloaddami sta ciola");
					clearMatchStorage();
					router.replace({ name: "playpage" });
					return;
				}
				if (playing === ePlaying.UNKNOWN)
				{
					debug("[ClassicGame]: stato incerto, back ma che combini?");
					router.replace({ name: "playpage" });
					return;
				}

				const restored = await reloadMatch();

				if (!alive)
					return
				if (!localMatchState && !restored)
				{
					clearMatchStorage();
					router.replace({ name: "playpage" });
					return
				}
			}
			ready.value = true;
		} catch (err) { debug("[mounted di ClassicGame]: Errore nel mounting!\n" + err) }
	})

	watch(ready, (val) => {
		if (val)
			requestToBack(null, null, "history");
	}, { once: true });// questo perchè la history si chiede una volta sola
		

	onUnmounted(() => { alive = false; clearMatchStorage(); });
</script>

<template>
    <div id="wrapping" class="flex z-2 bg-bg-darker rounded-3xl">
		<KingsCodex v-if="ready"/>
        <div class="p-6 bg-bg-default rounded-l-3xl border-r border-border-default">
          <div v-if="ready">
            <PlayerInfo :p="topP" pos="top"/>
            <div class="relative">
                <ChessBoard :style="style"/>
                <EndGameOverlay/>
            </div>
            <PlayerInfo :p="bottomP" pos="bottom"/>
        	</div>
			<div v-else class="flex flex-col items-center justify-center gap-6 py-20">
				<div class="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
				<p  class="text-white text-xl tracking-widest">
					Loading<span class="dot dot-1">.</span><span class="dot dot-2">.</span><span class="dot dot-3">.</span>
				</p>
        	</div>
		</div>
        <div class="mt-10 w-md px-6 flex flex-col gap-4">
			<MovesHistory v-if="ready" class="h-87.5"/>
			<ActionButtons v-if="ready"/>
			<ChatBox	 v-if="ready"/>
		</div>
    </div>
</template>

<style scoped>
    h1, h4 {
        font-family: "Copperplate", Times;
    }
</style>