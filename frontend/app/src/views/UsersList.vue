<script setup>
    import UserAvatar from '@/components/UserAvatar.vue';
    import TagTitle from '../components/TagTitle.vue';
    import { ref, watch }       from 'vue';
    import { api }              from '../router/api/client';
    import { useI18n } from 'vue-i18n';

    const   { t } = useI18n(),
            prop = defineProps({
	            query: {
	            	type: String,
	            	default: ''
	            }
	        }),
            db = ref([]);

    async function loadUserData(username) {
        try { db.value = (await api.get(`/api/users/?username=${username}`)).data.users; }
        catch { db.value = []; }
    };

    watch(
        () => prop.query,
        (username) => {
            loadUserData(username);
        },
        { immediate: true }
    );

</script>

<template>
    <div class="flex flex-col z-2 bg-bg-default rounded-3xl max-md:mt-10 max-[375px]:w-screen max-[375px]:h-screen">
        <div class="text-text-default text-2xl mx-7.5 mt-7.5 max-md:text-center">
            <h2 class="flex" v-if="query.length > 11">{{ t('menu.userList', { nUser: db.length }) }}
                <p class="font-semibold">{{ query.slice(0, 10) + '...' }}</p>"</h2>
            <h2 class="flex" v-if="query.length <= 11">{{ t('menu.userList', { nUser: db.length }) }}
                <span class="font-semibold">{{ query }}</span>"</h2>
            <hr class="text-text-last self-center w-auto">
        </div>
        <div class="p-8 grid max-md:grid-cols-2 md:grid-cols-4 gap-10 w-full justify-items-center" :class="db.length > 8 ? 'max-[375px]:max-h-[80vh] max-h-[75vh] overflow-y-auto' : ''">
            <div v-for="user in db" v-if="db" class="w-fit">
                <RouterLink :to="{ name: 'user_page', params: { username: user.username } }">
                    <UserAvatar :src="user.image"
				        alt="" class="max-md:size-25 md:size-35 rounded-t-md place-self-center object-cover bg-linear-to-t from-main-color to-bg-default" />
                    <div class="bg-bg-darker py-2 grid grid-cols-1 border-b border-x border-border-default rounded-b-md w-full justify-items-center">
                        <h3 class="text-text-default max-md:text-xs" v-if="user.username.length > 11">{{ user.username.slice(0, 10) + "..."}}</h3>
                        <h3 class="text-text-default max-md:text-xs" v-if="user.username.length <= 11">{{ user.username }}</h3>
                        <TagTitle :title="user?.title" class="mt-1 w-fit"/>
                    </div>
                </RouterLink>
            </div>
            <p v-if="!db[0]" class="text-text-default text-2xl col-span-4 place-self-center">
                :(</p>
        </div>
    </div>
</template>

<style scoped>
</style>