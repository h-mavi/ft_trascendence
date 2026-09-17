<script setup>
	import { acceptRequest, rejectRequest }	from '../scripts/Helper/CompUtils';
	import { ref, onMounted, watch }		from 'vue';
	import { useAuthStore }					from '@/stores/auth.st';
	import { taskApi }						from '../router/api/task.api';
	import { useI18n }						from 'vue-i18n';
	import { debug }						from '../scripts/Data/Variables';
	import { api }							from '../router/api/client';
	import IconCheck               from './icons/IconCheck.vue';
	import IconCross               from './icons/IconCross.vue';
	import IconUserGroup           from './icons/IconUserGroup.vue';
	import IconUserPlus            from './icons/IconUserPlus.vue';

    const   { t } = useI18n();
	const   prop = defineProps({
  				user: Object
			}),
			friends = ref(null), state = ref(null);
 
	//NOTE - Funzione che serve a settare il bottone nelle pagine utenti in modo corretto tra le 4 opzioni:
	//		 -1 = user loggato e utente della pagina non sono amici -> chiedi amicizia
	//		  0 = l'amizia tra i due e' in pending ed e' l'utente loggato ad aver chiesto l'amicizia -> pending
	//		  1 = l'amizia tra i due e' in pending e l'utente loggato deve accettarla o rifiutarla -> accetta o rifiuta
	//		  2 = i due utenti sono amici
	async function updateState() {
		try
		{
			friends.value = await taskApi.friendlist();
			const isFriend = friends.value.find(x => (x.friend.username === prop.user.username));
	
			if (isFriend) {
				if (isFriend.friend_status !== 'pending')
					state.value = 2;
				else if (isFriend.friend_status === 'pending') {
					if (isFriend.sender.username === prop.user.username)
						state.value = 1;
					else
						state.value = 0;
				}
			}
			else { state.value = -1; }
		}
		catch(err) { debug("[updateState]: Errore di update dello stato dei bottoni!\n" + err); }
	}

	async function sendRequest()
	{
		try
		{
			await api.post("/api/friends", { id_friend: prop.user.id_user });
			await api.post("/api/notifications", 
							{	title: "F",
								description: " ",
								id_receiver: prop.user.id_user });
			await useAuthStore().fetchMe(true);
			updateState();
		}
		catch(err) { debug("[sendRequest]: Errore nel mandare richeste d'amicizia!\n" + err); }
		
	}

	async function hiddenReload(func) {
		try {
    	    await func(prop.user.id_user);
    	    await updateState();
    	}
    	catch (err) { debug("[hiddenReload]: Errore nel reload nascosto!\n" + err); }
	}

	onMounted(updateState); 
	watch(() => prop.user, updateState, { deep: true });
	
</script>

<template>
	<button class="flex w-max max-md:p-1.5 md:p-2.5 md:pl-4 gap-3 cursor-pointer rounded-md inset-ring justify-self-end-safe
					 bg-bg-accept text-online-accept inset-ring-inset-accept"
			@click="sendRequest()"
			v-if="state == -1">
			<IconUserPlus class="max-md:size-5 md:size-6"/>
		<p class="max-md:hidden">{{ t('userPage.sendRequest') }}</p>
	</button>



	<div class="w-max justify-self-end-safe" v-if="state ==  1">
		<button class="cursor-pointer rounded-l-md inset-ring p-2.5
					bg-bg-accept text-online-accept inset-ring-inset-accept"
			@click="hiddenReload(acceptRequest)">
			<p class="max-md:hidden">{{ t('common.accept') }}</p>
			<IconCheck class="md:hidden size-5" stroke-width="1.5"/>
		</button>
		<button class="cursor-pointer rounded-r-md inset-ring p-2.5
						bg-bg-reject text-text-lose-closed inset-ring-inset-reject"
				@click="hiddenReload(rejectRequest)">
			<p class="max-md:hidden">{{ t('common.reject') }}</p>
			<IconCross class="md:hidden size-5" stroke-width="1.5"/>
		</button>
	</div>



	<div class="w-max max-md:p-1.5 md:p-2.5 md:pl-4 rounded-md inset-ring justify-self-end-safe flex gap-3"
		v-bind:class="{ 'bg-bg-await text-text-draw-await inset-ring-inset-await' : state == 0,
						'bg-bg-tour-friend text-text-tour-friend inset-ring-inset-tour-friend' : state == 2 }"
		v-if="state == 0 || state == 2">
		<IconUserGroup v-if="state == 2" class="max-md:size-5 md:size-6"/>
		<div v-if="state == 0" class="animate-spin border-3 border-text-draw-await border-t-transparent rounded-full max-md:size-4.5 md:size-7"></div>
		<p v-if="state == 2" class="max-md:hidden">{{ t('common.friend', 2) }}</p>
		<p v-if="state == 0" class="max-md:hidden">{{ t('common.pending') }}</p>
	</div>


</template>

<style scoped>
</style>