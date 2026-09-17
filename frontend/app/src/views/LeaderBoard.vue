<script setup>
import UserAvatar from '@/components/UserAvatar.vue';
import TagTitle from '../components/TagTitle.vue';
import { ref, onMounted } from 'vue';
import { useAuthStore } from "../stores/auth.st";
import { storeToRefs }  from 'pinia';
import { useI18n }      from 'vue-i18n';
import { api }          from '../router/api/client';
import { debug }        from '../scripts/Data/Variables.js'

const   { t } = useI18n(),
        lBoard = ref([]),
        top3 = ref([]),
        last7 = ref([]),
        authStore = useAuthStore(),
		{ user } = storeToRefs(authStore),
        loaded = ref(false),
        top = ref(false);

function winRate(win, total) {
    if (!total) { return (0); }
    return (Math.round((win / total) * 100));
}

onMounted(async () => {
    try {
        lBoard.value = (await api.get("api/users/leaderboard")).data?.list ?? [];
        lBoard.value.sort((a, b) => b.points - a.points);

        top3.value = lBoard.value.slice(0, 3);
        last7.value = lBoard.value.slice(3, 10);
        if (user.value && lBoard.value.some((u) => u.id_user == user.value.id_user))
            top.value = true;
    }
    catch (err) { debug("[mounted di LeaderBoard]: Errore nel mounting!\n" + err) }
    finally { loaded.value = true; }
});
</script>

<template>
    <div class="flex flex-col z-2 bg-bg-darker text-text-default
        max-md:w-screen max-md:h-screen max-md:pt-15 max-md:overflow-y-scroll max-md:overflow-x-hidden
        md:rounded-3xl md:w-[95vw] md:h-fit
        lg:w-[55vw]">
        <h2 class="px-6 py-4 font-semibold self-center max-md:text-2xl text-3xl">{{ t('leaderBoard.title') }}</h2>
        <div v-if="lBoard.length" class="flex flex-col mx-4 mb-1 p-2 bg-bg-default rounded-3xl border border-border-default">
            <div v-if="top3[0]" class="relative justify-items-center justify-self-center z-2"
                :class="top3.length > 2 ? '-mb-7' : 'mb-2'">
                <p class="text-text-second max-md:text-sm">{{ top3[0].points }}</p>
                <div class="relative">
                    <UserAvatar class="rounded-full object-cover max-md:size-25 md:size-27" :src="top3[0].image" />
                    <TagTitle :title="top3[0].title" class="absolute
                        max-md:-bottom-1 max-md:-right-5
                        md:-bottom-2 md:-right-4"/>
                </div>
                <RouterLink :to="{ name: 'user_page', params: { username: top3[0].username } }" class="flex items-center gap-2 mt-3">
                    <h3 class="max-md:text-base md:text-xl"><b>1°</b></h3>
                    <p class="hover:underline max-md:text-base">{{ top3[0].username }}</p>
                </RouterLink>
                <div class="flex gap-2 max-md:text-sm">
                    <p class="text-text-win-open">{{ winRate(top3[0].stats.w, top3[0].stats.total) }}%</p>
                    {{ t('leaderBoard.outOf', { games: top3[0].stats.total }) }}
                </div>
            </div>

            <div v-if="top3.length > 1" class="grid grid-rows-1"
                :class="[ top3.length > 2 ? 'grid-cols-2' : 'grid-cols-1',
                        top3.length < 3 ? 'mt-4' : (top ? 'max-md:mt-10 md:-mt-7' : 'max-md:mt-10 md:-mt-15') ]">
                <div v-for="(p, i) in top3.slice(1)" :key="p.id_user" class="justify-items-center">
                    <p class="text-text-second max-md:text-sm">{{ p.points }}</p>
                    <div class="relative">
                        <UserAvatar class="rounded-full object-cover max-md:size-20 md:size-22" :src="p.image" />
                        <TagTitle :title="p.title" class="absolute
                            max-md:-bottom-1 max-md:-right-5
                            md:-bottom-2 md:-right-4
                            lg:-bottom-2 lg:-right-7"/>
                    </div>
                    <RouterLink :to="{ name: 'user_page', params: { username: p.username } }" class="flex items-center gap-2 mt-3">
                        <h3 class="max-md:text-base md:text-xl"><b>{{ i + 2 }}°</b></h3>
                        <p class="hover:underline max-md:text-base">{{ p.username }}</p>
                    </RouterLink>
                    <div class="flex gap-2 max-md:text-sm">
                        <p class="text-text-win-open">{{ winRate(p.stats.w, p.stats.total) }}%</p>
                        {{ t('leaderBoard.outOf', { games: p.stats.total }) }}
                    </div>
                </div>
            </div>
        </div>
        <p v-else-if="loaded" class="mx-4 mb-1 p-10 text-center text-text-second bg-bg-default rounded-3xl border border-border-default">
            {{ t('leaderBoard.empty') }}
        </p>

        <div class="flex flex-col mt-1">
            <div v-for="(p, index) in last7" :key="p.id_user">
                <div class="flex items-center max-md:px-2 md:px-4">
                    <h3 class="max-md:ml-1 md:ml-3 max-md:text-sm" :class="{ 'max-md:mr-1 md:mr-2' : index == 6, 'max-md:mr-3 md:mr-5' : index != 6 }"><b>{{ index + 4 }}°</b></h3>
                    <div class="grid grid-cols-2 gap-2 items-center" :class=" top ? 'max-md:m-1 md:m-2' : 'max-md:m-0.5 md:m-1.5'">
                        <div class="flex items-center gap-2 max-md:w-screen md:w-[33vw] lg:w-[20vw]">
                            <UserAvatar class="rounded-full object-cover max-md:size-9 md:size-10" :src="p.image" />
                            <RouterLink :to="{ name: 'user_page', params: { username: p.username } }">
                                <p class="max-md:hidden text-text-default hover:underline max-md:text-sm" :class="p.username == user?.username ? 'font-semibold' : ''">{{ p.username }}</p>
                                <p v-if="p.username.length > 9" :class="p.username == user?.username ? 'font-semibold' : ''"
                                    class="md:hidden text-text-default hover:underline max-md:text-sm">{{ p.username.slice(0, 8) + "..." }}</p>
                                <p v-if="p.username.length <= 9" :class="p.username == user?.username ? 'font-semibold' : ''"
                                    class="md:hidden text-text-default hover:underline max-md:text-sm">{{ p.username }}</p>
                            </RouterLink>
                            <TagTitle :title="p.title" class="max-[425px]:text-[9px] max-[425px]:py-0.75"/>
                        </div>
                        <div class="flex items-center justify-end-safe gap-1 w-full">
                            <div class="flex gap-2 text-text-second max-md:text-xs">
                                <p class="text-text-win-open">{{ winRate(p.stats.w, p.stats.total) }}%</p>
                                <p class="md:hidden">WR</p>
                                <p class="max-md:hidden">{{ t('leaderBoard.outOf', { games: p.stats.total }) }}</p>
                            </div>
                            <p class="text-text-last max-[375px]:hidden">|</p>
                            <p class="text-text-second max-[375px]:hidden max-md:text-xs md:text-xs">ELO: {{ p.points }}</p>
                        </div>
                    </div>
                </div>
                <hr v-if="index != last7.length - 1" class="w-full justify-self-start text-text-last">
            </div>
        </div>
        <div v-if="!top && user">
            <hr class="text-text-last border-dashed">
            <div class="flex items-center px-4">
                <h3 class="font-semibold max-md:text-sm max-md:-ml-0.5 max-md:mr-2.5
                        md:ml-3.75 md:mr-4">Tu</h3>
                <div class="grid grid-cols-2 gap-2 items-center max-md:m-0.5 md:m-1.5">
                    <div class="flex items-center gap-2 max-md:w-screen md:w-[33vw] lg:w-[20vw]">
                        <UserAvatar class="rounded-full object-cover max-md:size-9 md:size-10" :src="user.image" />
                        <RouterLink :to="{ name: 'user_page', params: { username: user.username } }">
                            <p class="max-md:hidden text-text-default hover:underline font-semibold max-md:text-sm">{{ user.username }}</p>
                            <p v-if="user.username.length > 9"
                                class="md:hidden text-text-default hover:underline font-semibold max-md:text-sm">{{ user.username.slice(0, 8) + "..." }}</p>
                            <p v-if="user.username.length <= 9"
                                class="md:hidden text-text-default hover:underline font-semibold max-md:text-sm">{{ user.username }}</p>
                        </RouterLink>
                        <TagTitle :title="user.title" class="max-[425px]:text-[9px] max-[425px]:py-0.75"/>
                    </div>
                    <div class="flex items-center justify-end-safe gap-1 w-full">
                        <!-- <div class="flex gap-2 text-text-second"><p class="text-text-win-open">{{ winRate(user.stats.w, user.stats.total) }}%</p>su {{ user.stats.total }}</div> -->
                        <!-- <p class="text-text-last">|</p> -->
                        <p class="text-text-second max-md:text-xs md:text-xs">ELO: {{ user.points }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
</style>
