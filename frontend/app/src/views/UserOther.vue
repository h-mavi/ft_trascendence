<script setup>
    import UserAvatar from '@/components/UserAvatar.vue';
    import TagTitle from '../components/TagTitle.vue';
    import FriendList from '../components/FriendList.vue';
    import StatusOnline from '../components/StatusOnline.vue';
    import FriendButton from '../components/FriendButton.vue';
    import MatchHistory from '../components/MatchHistory.vue';
    import { useAuthStore } from "../stores/auth.st";
    import { storeToRefs }  from 'pinia';
    import { ref, watch }   from 'vue';
    import { useI18n }      from 'vue-i18n';
    import { api }          from '../router/api/client';

    const   { t } = useI18n(),
            authStore = useAuthStore(),
	        { user } = storeToRefs(authStore),
            prop = defineProps({
  	    	    username: String
	        }),
	        friends = ref(null), matches = ref(null), otherUser = ref(null);

    async function loadUserData(username) {
        if (!username) {
            otherUser.value = null;
            friends.value = null;
            matches.value = null;
            return;
        }

        try{
            otherUser.value = (await api.get(`/api/users/username/${username}`)).data.user;
            friends.value = (await api.get(`/api/friends/${otherUser.value.id_user}`)).data.friendship;
            matches.value = (await api.get(`/api/matchesHistory/user/${otherUser.value.id_user}`)).data.matches;
        }
        catch{}
    }

    watch(
        () => prop.username,
        (username) => {
            loadUserData(username);
        },
        { immediate: true }
    );

</script>

<template>
    <div v-if="otherUser" class="flex-row z-2 bg-bg-darker md:rounded-3xl
            max-md:w-screen max-md:h-screen max-md:pt-15 max-md:overflow-y-scroll
            md:w-[90vw] md:h-full
            2xl:max-w-[50vw] 2xl:h-[80vh]">
        <div class="flex relative p-2 m-4 mb-2 bg-bg-default rounded-3xl border border-border-default">
            <UserAvatar :src="otherUser.image"
                    alt="avatar" class="rounded-full place-self-start object-cover
                    max-[425px]:m-1.5 max-[425px]:size-25 min-[425px]:m-3 min-[425px]:size-30 md:size-35 max-lg:m-3 lg:m-5" />
            <StatusOnline v-if="user.id_user === otherUser.id_user || friends?.find((frie) => frie.friend.id_user === user.id_user && frie.friend_status !== 'pending')"
                :user_id="otherUser.id_user" class="max-md:size-5 max-[425px]:ml-22 max-[425px]:mt-22
                    min-[425px]:ml-26 min-[425px]:mt-26
                    md:size-6 md:ml-31 md:mt-31"/>
            <div>
                <div class="max-[375px]:w-35 min-[375px]:w-45 md:w-[60vw] 2xl:w-[35vw]
                            grid grid-cols-2 items-center mt-5 max-md:mb-1">
                    <h2 class="max-md:hidden text-text-default max-[375px]:text-lg min-[375px]:text-2xl md:text-3xl">{{ otherUser.username }}</h2>
                    <h2 class="md:hidden text-text-default max-[375px]:text-lg min-[375px]:text-2xl md:text-3xl" v-if="otherUser.username.length > 9">
                        {{ otherUser.username.slice(0, 8) + "..." }}</h2>
                    <h2 class="md:hidden text-text-default max-[375px]:text-lg min-[375px]:text-2xl md:text-3xl" v-if="otherUser.username.length <= 9">
                        {{ otherUser.username }}</h2>
                    <FriendButton :user="otherUser" v-if="otherUser.username !== user.username"/>
                </div>
                <h3 class="text-text-second self-center -mt-0.5 
                    max-[375px]:text-xs min-[375px]:text-sm max-md:whitespace-nowrap md:text-base">{{ otherUser.name }} {{ otherUser.surname }}</h3>
                <div class="lg:hidden flex max-md:mt-3 md:mt-4 gap-2">
                    <TagTitle :title="otherUser?.title" class="max-[375px]:text-[9px] max-[375px]:py-px"/>
                    <p class="text-text-last">|</p>
                    <h4 class="text-text-second self-center max-[375px]:text-xs min-[375px]:text-xl md:text-2xl">ELO: {{ otherUser.points }}</h4>    
                </div>
                <TagTitle :title="otherUser?.title" class="max-lg:hidden mt-1"/>
                <h4 class="max-lg:hidden text-text-second text-2xl mt-5 justify-self-start">ELO: {{ otherUser.points }}</h4>
            </div>
        </div>
        <div class="flex m-4 max-md:flex-col">
            <div class="w-full md:m-2 p-2 h-[50vh] bg-bg-default rounded-3xl border border-border-default overflow-hidden">
                <h2 class="text-text-default text-xl m-1">{{ t('userPage.friendList') }}</h2>
                <hr class="w-full justify-self-start text-text-last">
                <div v-if="friends" :class="friends.length > 4 ? 'lg:max-h-[45.75vh] md:max-h-[46vh] max-md:h-[44vh] overflow-y-auto' : ''">
                    <FriendList :friendlist="friends" :remove-f="false"/>
                </div>
            </div>
            <div class="w-full max-md:my-2 md:m-2 p-2 h-[50vh] bg-bg-default rounded-3xl border border-border-default overflow-hidden">
                <h2 class="text-text-default text-xl m-1">{{ t('userPage.matchHistory') }}</h2>
                <hr class="w-full justify-self-start text-text-last">
                <div v-if="matches?.stats" class="flex gap-2 m-2 max-[375px]:text-xs min-[375px]:text-sm text-text-default justify-self-center">
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
                <div v-if="matches" :class="matches.matches.length > 4 ? 'lg:max-h-[41.5vh] md:max-h-[43vh] max-md:h-[40.5vh] overflow-y-auto' : ''">
                    <MatchHistory :matches="matches.matches"/>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
</style>