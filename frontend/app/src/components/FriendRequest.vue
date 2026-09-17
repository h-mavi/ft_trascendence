<script setup>
    import UserAvatar from '@/components/UserAvatar.vue';
    import { acceptRequest, rejectRequest } from '../scripts/Helper/CompUtils';
    import { computed, ref } from 'vue';
    import { useI18n }  from 'vue-i18n';
    import IconCheck               from './icons/IconCheck.vue';
    import IconChevronLeft         from './icons/IconChevronLeft.vue';
    import IconChevronRight        from './icons/IconChevronRight.vue';
    import IconCross               from './icons/IconCross.vue';

    const { t } = useI18n();
    const prop = defineProps({
  	    	friendReq: Array,
            user: Object
	    });
    let     index = ref(0);
    const   currentRequest = computed(() => prop.friendReq[index.value] ?? null);

    const goPrev = () => {
        if (index.value > 0)
            index.value--;
        else
            index.value = prop.friendReq.length - 1;
    };

    const goNext = () => {
        if (index.value < prop.friendReq.length - 1)
            index.value++;
        else
            index.value = 0;
    };
</script>

<template>
    <div class="my-2
            max-md:w-65
            md:w-full max-lg:mx-2 
            lg:w-90 lg:mx-5">
        <div v-if="currentRequest" class="grid grid-flow-col h-18">
            <button @click="goPrev" v-bind:class="{'hidden' : friendReq.length <= 1, 'inline' : friendReq.length > 1 }"
                :disabled="!currentRequest"
                class="justify-self-start text-text-second self-center cursor-pointer">
                <IconChevronLeft class="max-lg:size-4.25 md:size-6"/>
            </button>

            <div class="flex my-2 justify-self-center">
                <RouterLink :to="{ name: 'user_page', params: { username: currentRequest.friend.username } }" class="flex items-center">
                    <UserAvatar class="rounded-full object-cover max-lg:size-12 md:size-13"
                        :src="currentRequest.friend.image" />
                    <div class="mx-2">
                        <p class="max-[375px]:hidden text-text-default max-lg:text-sm" v-if="currentRequest.friend.username.length > 12">
                            {{ currentRequest.friend.username.slice(0, 11) + "..." }}</p>
                        <p class="max-[375px]:hidden text-text-default max-lg:text-sm" v-if="currentRequest.friend.username.length <= 12">
                            {{ currentRequest.friend.username }}</p>
                        <p class="min-[375px]:hidden text-text-default max-lg:text-sm" v-if="currentRequest.friend.username.length > 7">
                            {{ currentRequest.friend.username.slice(0, 6) + "..." }}</p>
                        <p class="min-[375px]:hidden text-text-default max-lg:text-sm" v-if="currentRequest.friend.username.length <= 7">
                            {{ currentRequest.friend.username }}</p>
                        <p class="text-text-second max-lg:text-xs md:text-sm">ELO: {{ currentRequest.friend.points }}</p>
                    </div>
                </RouterLink>
                <div class="self-center max-lg:ml-4 lg:ml-7">
                    <button @click="acceptRequest(currentRequest.friend.id_user)"
                        class="p-1.25 cursor-pointer justify-self-end-safe rounded-l-md inset-ring 
                            bg-bg-accept text-online-accept inset-ring-inset-accept">
                        <IconCheck class="max-lg:size-4.25 md:size-6" stroke-width="1.5"/>
                    </button>
                    <button @click="rejectRequest(currentRequest.friend.id_user)"
                        class="p-1.25 cursor-pointer justify-self-end-safe rounded-r-md inset-ring 
                            bg-bg-reject text-text-lose-closed inset-ring-inset-reject">
                        <IconCross class="max-lg:size-4.25 md:size-6" stroke-width="1.5"/>
                    </button>
                </div>
            </div>

            <button @click="goNext" v-bind:class="{'hidden' : friendReq.length <= 1, 'inline' : friendReq.length > 1 }"
                :disabled="!currentRequest"
                class="justify-self-end text-text-second self-center cursor-pointer">
                <IconChevronRight class="max-lg:size-4.25 md:size-6"/>

            </button>
        </div>
        <div v-if="!currentRequest" class="flex flex-row justify-center h-18">
            <p class="text-text-default self-center justify-self-center">{{ t('userPage.pendingRequest') }}</p>
        </div>
    </div>
</template>

<style scoped>
</style>