<script setup>
    import UserAvatar from '@/components/UserAvatar.vue';
    import TagTitle from './TagTitle.vue';
    import StatusOnline from './StatusOnline.vue';
    import { rejectRequest } from '../scripts/Helper/CompUtils';
    import { computed } from 'vue';
    import { useI18n }  from 'vue-i18n';

    const { t } = useI18n();
    const prop = defineProps({
  	    	friendlist: Array,
            removeF: Boolean
	    });

    const visibleFriendlist = computed(() => prop.friendlist.filter((b) => b.friend_status !== 'pending'));

</script>

<template>
        <div v-for="(besties, index) in visibleFriendlist" :key="besties.friend.id_user">
            <RouterLink :to="{ name: 'user_page', params: { username: besties.friend.username } }">
                <div class="flex ml-2 relative max-lg:my-2.5 md:my-3">
                    <UserAvatar class="rounded-full object-cover max-lg:size-12 md:size-13"
                        :src="besties.friend.image" />
                    <StatusOnline :user_id="besties.friend.id_user" v-if="removeF"/>
                    <div class="mx-2">
                        <p class="text-text-default hover:underline max-lg:text-sm" v-if="besties.friend.username.length <= 15">
                            {{ besties.friend.username }}</p>
                        <p class="text-text-default hover:underline max-lg:text-sm" v-if="besties.friend.username.length > 15">
                            {{ besties.friend.username.slice(0, 14) + "..." }}</p>
                        <div class="flex items-center gap-1">
                            <TagTitle :title="besties.friend.title"/>
                            <p class="text-text-last">|</p>
                            <p class="text-text-second max-lg:text-xs md:text-sm">ELO: {{ besties.friend.points }}</p>
                        </div>
                    </div>
                    <button v-if="removeF" @click.stop.prevent="rejectRequest(besties.friend.id_user)"
                                class="max-lg:hidden h-[80%] p-1.25 px-2 mr-1 ml-auto cursor-pointer self-center rounded-md inset-ring text-sm
                                    bg-bg-reject text-text-lose-closed inset-ring-inset-reject">{{ t('userPage.removeFriend') }}</button>
                    <button v-if="removeF" class="lg:hidden text-text-lose-closed text-lg self-start ml-auto mr-2" :title="t('userPage.removeFriend')"
                        type="button" @click.stop.prevent="rejectRequest(besties.friend.id_user)">&times;</button>
                </div>
            </RouterLink>
            <hr v-if="index !== visibleFriendlist.length - 1" class="text-text-last border-dashed">
        </div>
</template>

<style scoped>
</style>