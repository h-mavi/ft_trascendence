<script setup>
    import UserAvatar from '@/components/UserAvatar.vue';
    import TagTitle         from '../components/TagTitle.vue';
    import FriendList       from '../components/FriendList.vue';
    import MatchHistory     from '../components/MatchHistory.vue';
    import FriendRequest    from '../components/FriendRequest.vue';
    import { ref, onMounted, watch }   from 'vue';
    import { useAuthStore }     from "../stores/auth.st";
    import { storeToRefs }      from 'pinia';
    import { useI18n }          from 'vue-i18n';
    import { taskApi }          from '../router/api/task.api';
    
    const { t } = useI18n();
	const friends = ref(null), matches = ref(null), fReq = ref([]);
    const authStore = useAuthStore();
	const { user } = storeToRefs(authStore);

    async function getFriends()
    {
        friends.value = await taskApi.friendlist();
        fReq.value = [];

        friends.value.forEach(friendship => {
            if (friendship.friend_status === "pending" && friendship.sender.username !== user.value.username)
                fReq.value.push(friendship);
        });
    }

    onMounted(async () => {
        try
        {
            await getFriends();
            matches.value = await taskApi.matchlist();
        }
        catch {}
    });

    watch(() => user.value, getFriends, { deep: true });
</script>

<template>
    <div class="flex-row z-2 bg-bg-darker md:rounded-3xl
        max-md:w-screen max-md:h-screen max-md:pt-15 max-md:overflow-y-scroll
        md:w-[90vw] md:h-full
        2xl:max-w-[50vw] 2xl:h-[80vh]">
        <div class="flex p-2 m-4 mb-2 bg-bg-default rounded-3xl border border-border-default">
                <UserAvatar :src="user.image"
                    alt="avatar" class="rounded-full place-self-start object-cover
                    max-[425px]:m-1.5 max-[425px]:size-25 min-[425px]:m-3 min-[425px]:size-30 md:size-35 max-lg:m-3 lg:m-5" />
            <div>
                <h2 class="text-text-default mt-5 max-[375px]:text-lg min-[375px]:text-2xl md:text-3xl">{{ user.username }}</h2>
                <div class="md:flex gap-3 my-1">
                    <h3 class="text-text-second self-center 
                        max-[375px]:text-xs min-[375px]:text-sm max-md:whitespace-nowrap md:text-base">{{ user.name }} {{ user.surname }}</h3>
                    <p class="max-md:hidden text-text-last">|</p>
                    <h4 class="text-text-third self-center max-[375px]:text-[10px] min-[375px]:text-xs md:text-sm">{{ user.email }}</h4>
                </div>
                <div class="lg:hidden flex max-md:mt-3 md:mt-4 gap-2">
                    <TagTitle :title="user?.title" class="max-[375px]:text-[9px] max-[375px]:py-px"/>
                    <p class="text-text-last">|</p>
                    <h4 class="text-text-second self-center max-[375px]:text-xs min-[375px]:text-xl md:text-2xl">ELO: {{ user.points }}</h4>    
                </div>
                <TagTitle :title="user?.title" class="max-lg:hidden mt-1"/>
                <h4 class="max-lg:hidden text-text-second text-2xl mt-5">ELO: {{ user.points }}</h4>
            </div>
        </div>
        <div class="flex max-md:flex-col m-4">
            <div class="md:m-2 w-full">
                <div class="w-full p-2 mb-2 h-[35vh] bg-bg-default rounded-3xl border border-border-default overflow-hidden">
                    <h2 class="text-text-default text-xl m-1">{{ t('userPage.friendList') }}</h2>
                    <hr class="w-full justify-self-start text-text-last">
                    <div v-if="friends" :class="friends.length > 3 ? 'max-h-[30.5vh] overflow-y-auto' : ''">
                        <FriendList :friendlist="friends" :remove-f="true"/>
                    </div>
                </div>
                <div class="w-full p-2 h-auto bg-bg-default rounded-3xl border border-border-default">
                    <h2 id="fr" :data-count="fReq.length" class="relative flex flex-row text-text-default m-1 max-md:text-lg md:text-xl">
                        {{ t('userPage.friendRequest') }}</h2>
                    <hr class="w-full justify-self-start text-text-last">
                    <FriendRequest :friendReq="fReq" :user="user" class="justify-self-center"/>
                </div>
            </div>
            <div class="w-full max-md:my-2 md:m-2 p-2 h-auto bg-bg-default rounded-3xl border border-border-default overflow-hidden">
                <h2 class="text-text-default text-xl m-1">{{ t('userPage.matchHistory') }}</h2>
                <hr class="w-full justify-self-start text-text-last">
                <div v-if="matches" class="flex gap-2 m-2 max-[375px]:text-xs min-[375px]:text-sm text-text-default justify-self-center">
                    <div class="flex gap-2">
                        <p>W:</p>
                        <p class="text-text-win-open">{{ matches.stats.w }}</p>
                    </div>
                    <p class="text-text-last">|</p>
                    <div class="flex gap-2">
                        <p>D:</p>
                        <p class="text-text-draw-await">{{ matches.stats.d }}</p>
                    </div>
                    <p class="text-text-last">|</p>
                    <div class="flex gap-2">
                        <p>L:</p>
                        <p class="text-text-lose-closed">{{ matches.stats.l }}</p>
                    </div>
                    <p class="text-text-last">|</p>
                    <div class="flex gap-2">
                        <p>Games:</p>
                        <p>{{ matches.stats.total }}</p>
                    </div>
                </div>
                <hr class="w-full justify-self-start text-text-last">
                <div v-if="matches" :class="matches.matches.length > 4 ? 'lg:max-h-[41.5vh] md:max-h-[40vh] max-md:h-[38vh] overflow-y-auto' : ''">
                    <MatchHistory :matches="matches.matches"/>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>

    #fr::after {
        content: attr(data-count);
        right: 0;
        top: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.1px;
        width: 1.1rem;
        height: 1.1rem;
        font-size: 10px;
        border-radius: 9999px;
        background-color: var(--color-notif-on);
        font-size: 0.75rem;
        color: var(--color-text-default);
    }

    /* Nascondi il badge se count è 0 */
    #fr[data-count="0"]::after {
        content: "";
        display: none;
    }

</style>