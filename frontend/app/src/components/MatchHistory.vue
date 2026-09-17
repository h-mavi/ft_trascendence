    <script setup>
    import { rework_date }			from '../scripts/Helper/CompUtils';
    import { useI18n }				from 'vue-i18n';
    import IconCheck				from './icons/IconCheck.vue';
    import IconCross				from './icons/IconCross.vue';
    import IconEllipsis				from './icons/IconEllipsis.vue';
    // import { ref }					from 'vue';
    // import IconTrophyOutline       from './icons/IconTrophyOutline.vue';

    // const { t } = useI18n();
    const prop = defineProps({
  	    	matches: Array,
	    });

    // const selectedT = ref(null);

    // const openTournamentPopup = (game) => {
    //     selectedT.value = game;
    // };

    // const closeTournamentPopup = () => {
    //     selectedT.value = null;
    // };
</script>

<template>
    <div v-for="(game, index) in matches.slice().reverse()" :key="game.id_usermatch" class="ml-2">
        <div class="flex flex-row my-3.25 w-full">
            <div class="size-13 rounded-full items-center inline-flex text-lg"
                v-bind:class="{ 'bg-bg-win text-text-win-open' : game.result === 'Win',
                                'bg-bg-lose text-text-lose-closed' : game.result === 'Lose',
                                'bg-bg-draw text-text-default' : game.result === 'Draw', }">   
                <IconCheck    v-if="game.result === 'Win'"  stroke-width="1.5" class="size-7 ml-3"/>
                <IconCross    v-else-if="game.result === 'Lose'" stroke-width="1.5" class="size-7 ml-3"/>
                <IconEllipsis v-else-if="game.result === 'Draw'" class="size-7 ml-3"/>
            </div>
            <div class="text-text-default mx-2 w-30">
                <div class="flex gap-1">
                    <p>VS.</p>
                    <RouterLink :to="{ name: 'user_page', params: { username: game.opponent } }"
                            class="hover:underline">
                        <p class="max-[375px]:hidden" v-if="game.opponent && game.opponent.length > 11">
                            {{ game.opponent.slice(0, 10) + "..." }}</p>
                        <p class="max-[375px]:hidden" v-if="game.opponent && game.opponent.length <= 11">
                            {{ game.opponent }}</p>
                        <p class="min-[375px]:hidden" v-if="game.opponent && game.opponent.length > 7">
                            {{ game.opponent.slice(0, 6) + "..." }}</p>
                        <p class="min-[375px]:hidden" v-if="game.opponent && game.opponent.length <= 7">
                            {{ game.opponent }}</p>
                    </RouterLink>
                </div>
                <p class="text-sm text-text-second">{{ rework_date(game.date) }}</p>
            </div>
            <p class="self-center text-xl ml-auto mr-5"
                :class="{ 'text-text-win-open' : game.result === 'Win', 'text-text-lose-closed' : game.result === 'Lose', 'text-text-default' : game.result === 'Draw' }">
                {{ game.result }}
            </p>

            <!-- <div v-if="game.tournament" @click="openTournamentPopup(game)" class="flex gap-2 text-text-tour-friend ml-auto mr-4 self-center bg-bg-tour-friend inset-ring-inset-tour-friend inset-ring p-3 rounded-3xl cursor-pointer transition hover:bg-hover-tour">
                <IconTrophyOutline class="size-5"/>
                <p class="uppercase tracking-widest text-sm">{{ t('common.tournament', 1) }}</p>
            </div> -->

        </div>
        <hr v-if="index !== matches.length - 1" class="text-text-last border-dashed w-full">
    </div>

    <!-- <div v-if="selectedT" class="fixed inset-0 z-25 flex items-center justify-center bg-bg-blur backdrop-blur-xs px-4" @click.self="closeTournamentPopup">
        <div class="w-full max-w-md rounded-3xl border border-border-default bg-bg-default p-6 text-text-default shadow-2xl">
            <div class="flex items-start justify-between gap-4">
                <div>
                    <p class="text-sm uppercase tracking-widest text-text-tour-friend">{{ t('common.tournament', 1) }}</p>
                    <div class="flex items-center justify-start gap-2 mt-1">
                        <RouterLink to="/tournaments" class="hover:underline">
                            <h3 class="text-2xl">{{ selectedT.tournament.name }}</h3>
                        </RouterLink>
                        <p class="text-text-last">|</p>
                        <h4 :class="{	'text-text-win-open' : selectedT.tournament.status === 'open',
										'text-text-draw-await' : selectedT.tournament.status === 'ongoing',
										'text-text-lose-closed' : selectedT.tournament.status === 'closed' }">
                            {{ selectedT.tournament.status }}
                        </h4>
                    </div>
                    <hr class="w-[138%] justify-self-start text-text-last my-1">
                    <p class="text-sm text-text-second ml-1">{{ t('header.inv.creation', {date: rework_date(selectedT.tournament.created_at)}) }}
                        <RouterLink :to="{ name: 'user_page', params: { username: selectedT.tournament.creator.username } }" class="hover:underline">
                            {{ selectedT.tournament.creator.username }}
                        </RouterLink>
                    </p>
                </div>
                <button type="button" class="text-2xl leading-none text-text-third hover:text-text-default" @click="closeTournamentPopup">&times;</button>
            </div>
            <div class="mt-6 mb-3 flex gap-2 justify-self-center">
                <p v-if="selectedT.result == 'Win'" class="text-text-win-open">{{ selectedT.result }}</p>
                <p v-if="selectedT.result == 'Lose'" class="text-text-lose-closed">{{ selectedT.result }}</p>
                <RouterLink :to="{ name: 'user_page', params: { username: selectedT.player } }" class="hover:underline">
                    <p v-if="selectedT.player && selectedT.player.length > 11">
                        {{ selectedT.player.slice(0, 10) + "..." }}</p>
                    <p v-if="selectedT.player && selectedT.player.length <= 11">
                        {{ selectedT.player }}</p>
                </RouterLink>
                <p>VS.</p>
                <RouterLink :to="{ name: 'user_page', params: { username: selectedT.opponent } }" class="hover:underline">
                    <p v-if="selectedT.opponent && selectedT.opponent.length > 11">
                        {{ selectedT.opponent.slice(0, 10) + "..." }}</p>
                    <p v-if="selectedT.opponent && selectedT.opponent.length <= 11">
                        {{ selectedT.opponent }}</p>
                </RouterLink>
                <p v-if="selectedT.result == 'Lose'" class="text-text-win-open">Win</p>
                <p v-if="selectedT.result == 'Win'" class="text-text-lose-closed">Lose</p>
            </div>
            <div class="flex justify-self-center text-sm gap-5 text-text-second">
                <p>{{ rework_date(selectedT.date) }}</p>
                <p>Round: {{ selectedT.tournament.round }}</p>
            </div>
        </div>
    </div> -->
</template>

<style scoped>
</style>