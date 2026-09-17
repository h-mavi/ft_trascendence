<script setup>
	import UserAvatar from '@/components/UserAvatar.vue';
	import IconSearch from '@/components/icons/IconSearch.vue';
	import { rework_date }	from '../scripts/Helper/CompUtils';
	import { ref, onMounted }									from 'vue';
	import { useClickOutside }									from '@/scripts/Helper/generalUtils';
	import { useAuthStore }										from "../stores/auth.st";
	import { useTourStore }										from '../stores/tour.st';
	import { useMsgStore }										from '../stores/msg.st';
	import { storeToRefs }										from 'pinia';
	import { useI18n }											from 'vue-i18n';
	import { debug }											from "../scripts/Data/Variables";
	import { api }												from '../router/api/client';
	import router		from '../router/index.js';
	import IconBell		from './icons/IconBell.vue';
	import IconLogo     from './icons/IconLogo.vue';
	import IconSmile    from './icons/IconSmile.vue';
	import IconChevron  from './icons/IconChevron.vue';
	
	defineOptions({ inheritAttrs: false });
	
	const	{ t, locale } = useI18n({ useScope: 'global' }),
			msgStore = useMsgStore(),
			tourStore = useTourStore(),
			authStore = useAuthStore(),
			{ user } = storeToRefs(authStore),
			p_bool = ref(false),	//profile bool
			n_bool = ref(false),	//notification bool
			l_bool = ref(false),	//language bool
			p_dropdown = ref(null),
			n_dropdown = ref(null),
			l_dropdown = ref(null),
			popUp = ref(false),
			tourOpen = ref(null),
			db = ref([]),
			searchUser = ref("");

	async function submitForm() {
		await authStore.logout();
	}

	function goToUser() {
		const username = searchUser.value.trim();
		searchUser.value = "";
		if (!username) { return; }
		if (db.value.find(x => x.username === username))
			router.push(`/${encodeURIComponent(username)}`);
		else
			router.push(`/users/${encodeURIComponent(username)}`);
	}

	//un dropdown per chiamata: il listener resta attaccato solo mentre quel menu e' aperto
	useClickOutside(p_dropdown,	() => { p_bool.value = false; }, { when: p_bool });
	useClickOutside(n_dropdown,	() => { n_bool.value = false; }, { when: n_bool });
	useClickOutside(l_dropdown,	() => { l_bool.value = false; }, { when: l_bool });

	async function readMsg(msg)
	{
		if (msg.status === "not_read")
		{
			msg.status = 'read';
			try {
				await api.patch("/api/notifications", { id_notification: Number(msg.id_notification) }); }
			catch(err) { debug("[readMsg]: Errore di update delle notifiche!" + err); }
		}
	}

	async function readAllMsg()
	{
		msgStore.msgRecevied.forEach(async msg => { readMsg(msg) });
	}

	async function fetchTour(msg) {
		try {
            tourOpen.value = (await api.get(`/api/tournaments/${msg.description.slice(msg.description.indexOf('%') + 1)}`)).data.tournament;
			if (!tourOpen.value) { tourOpen.value = null; }
        }
        catch { tourOpen.value = null; }
		tourOpen.value.msg = msg;
	}

	async function accpetInvite() {
		const msg = tourOpen.value.msg.description;

		if (await tourStore.enterTour(msg.slice(msg.indexOf('|') + 1, msg.indexOf('%'))))
		{
			closePopup();
			router.push(`/tournament/${tourOpen.value.id_tournament}`);
		}
	}

	async function rejectInvite() {
		debug("Per ora e' inutile :)");
	}

	const closePopup = () => { popUp.value = false; };

	onMounted(async () => {
		try {
			if (user.value) { db.value = (await api.get("/api/users")).data.users; }
		}
		catch { debug("user non loggato, impossibile fare fetch su db");}
    });
</script>

<template>
	<datalist id="users">
		<option v-for="user in db" :key="user.username" :value="user.username"></option>
	</datalist>

	<div  v-bind="$attrs" class= "grid z-11 w-lvw bg-bg-default border-b border-border-second
								  max-md:grid-cols-2 max-md:h-13 max-md:fixed max-md:top-0
								  md:grid-cols-3 md:h-14
								  lg:h-15">
		<RouterLink to="/" id="button" class="w-fit">
			<div class="flex justify-self-start">
				<IconLogo class=" ml-3 place-self-center max-md:size-13 md:size-14 lg:size-15"/>
				<h1 class="text-text-default place-self-center max-md:text-3xl md:text-[37px] lg:text-4xl">ChessZ</h1>
			</div>
		</RouterLink>
		<div class="flex bg-bg-second rounded-4xl self-center content-center border border-border-default overflow-hidden
					max-md:hidden
					md:w-[120%] md:h-10 md:justify-self-start
					lg:w-[150%] lg:h-11 lg:justify-self-center">
			<IconSearch stroke="#AFB1B5" class="size-7 self-center ml-3" />
			<form @submit.prevent="goToUser">
				<input v-model="searchUser" type="search" name="searchBar" id="searchBar" :placeholder="t('common.search')" autocomplete="off"
					class="justify-self-center rounded-4xl pl-3 text-text-default
					md:h-9 md:w-71 md:text-xl md:pt-0.5
					lg:h-10 lg:w-[45vw] lg:text-[16px] lg:pt-1"
					:list="searchUser.length >= 2 ? 'users' : null">
			</form>
		</div>
		<div v-if="user" class="flex justify-self-end place-self-center">
			<div class="place-self-center relative" ref="n_dropdown">
				<button
					class="flex items-center cursor-pointer max-lg:mr-2 lg:mr-1"
					@click="n_bool = !n_bool"
					:aria-expanded="n_bool"
					:aria-label="t('header.notifications')"
					aria-haspopup="true">
					<div v-if="msgStore.msgRecevied && Array.from(msgStore.msgRecevied).find(m => m.status === 'not_read') !== undefined">
						<span class="absolute inline-flex translate-x-5.5 -translate-y-3.5 size-3 animate-ping rounded-full bg-notif-on opacity-75"></span>
						<span class="absolute justify-self-end translate-x-5.5 -translate-y-3.5 size-3 rounded-full bg-notif-on"></span>
					</div>
					<IconBell class="place-self-center text-form-icon max-md:size-8 md:size-9 lg:mr-4"/>
				</button>
				<Transition
					class="	max-lg:origin-[70%_0%] max-md:-translate-x-45 max-lg:translate-y-1
							md:-translate-x-40 md:origin-origin-[60%_0%]
							lg:origin-top-right lg:-translate-x-62 lg:translate-y-1.5"
					enter-active-class="transition ease-out duration-150"
					enter-from-class="opacity-0 scale-70"
					enter-to-class="opacity-100 scale-100"
					leave-active-class="transition ease-in duration-100"
					leave-from-class="opacity-100 scale-100"
					leave-to-class="opacity-0 scale-70">
					<div v-if="n_bool" class="mt-1.25 px-2 absolute bg-bg-darker border border-border-second w-76.5"
						:class="msgStore.msgRecevied.size > 3 ? 'w-79 max-h-[40vh] overflow-y-auto' : ''">
						<button :class="msgStore.msgRecevied && Array.from(msgStore.msgRecevied).find(m => m.status === 'not_read') !== undefined ? 'h-fit' : 'h-0 hidden'"
							class="cursor-pointer mx-auto mt-2 -mb-2 bg-main-color rounded-[7px] text-text-default hover:bg-linear-to-t from-main-color to-light-button
									text-sm w-full transition-transform"
							@click.stop="readAllMsg()">{{ t('header.readAll') }}</button>
						<div v-if="msgStore.msgRecevied" v-for="m in msgStore.msgRecevied"
							class="bg-bg-default p-2 my-2 rounded-sm text-text-default">
							<div class="flex gap-2 pb-1 items-center">
								<span class="py-1 block size-2 rounded-full"
									:class="{	'bg-notif-on' : m.status === 'not_read',
												'bg-text-third' : m.status === 'read' }"/> <!--NOTE ✓-->
								<h3 v-if="m.description[0] === ' ' && m.title === 'F'" class="text-base">{{ t('header.inv.friendTitle') }}</h3>
								<h3 v-if="m.description[0] === ' ' && m.title === 'T'" class="text-base">{{ t('header.inv.tourTitle') }}</h3>
								<h3 v-if="m.description[0] === ' ' && m.title === 'N'" class="text-[15px]">{{ t('header.inv.tagTitle') }}</h3>
								<h3 v-if="!['F', 'T', 'N'].includes(m.title) || ['F', 'T', 'N'].includes(m.title) && m.description[0] !== ' '"
									class="text-base">{{ m.title }}</h3>
								<p class="text-text-last">|</p>
								<p class="text-xs text-text-third">{{ rework_date(m.creation_date) }}</p>
							</div>
							<hr class="w-full justify-self-start text-text-last">
							<div class="items-end">
								<RouterLink v-if="m.description[0] === ' ' && m.title === 'F'" :to="{ name: 'user_page', params: { username: m.sender.username } }"
									@click="n_bool = false; readMsg(m);">
									<div class="flex gap-1 text-text-second text-sm pt-2.5 pb-1">
										<p class="hover:underline">{{ t('header.inv.friendNotif', {sender: m.sender.username}) }}</p>
									</div>
								</RouterLink>

								<div v-if="m.description[0] === ' ' && m.title === 'T'"
									@click="readMsg(m); fetchTour(m); n_bool = false; popUp = true;" class="cursor-pointer">
									<div class="flex gap-1 text-text-second text-sm pt-2.5 pb-1">
										<p class="hover:underline">{{ t('header.inv.tourNotif', {sender: m.sender.username, tour: m.description.slice(1, m.description.indexOf('|'))}) }}</p>
									</div>
								</div>

								<RouterLink v-if="m.description[0] === ' ' && m.title === 'N'" :to="{ name: 'me_page' }"
									@click="n_bool = false; readMsg(m);">
									<div class="flex gap-1 text-text-second text-sm pt-2.5 pb-1">
										<p class="hover:underline">{{ t('header.inv.tagNotif', {rank: user.title }) }}</p>
									</div>
								</RouterLink>

								<div v-if="m.description[0] !== ' '" @click="readMsg(m);">
									<p class="text-text-second text-sm pt-2.5 pb-1">{{ m.description }}</p>
									<div class="ml-auto -mt-3.5 flex gap-1 h-fit w-fit" v-if="m.sender">
										<p class="text-xs text-text-third">
											{{ t('common.by') }}</p>
										<RouterLink :to="{ name: 'user_page', params: { username: m.sender.username } }">
											<p class="text-xs text-text-third hover:underline" v-if="m.sender.username.length <= 10">
												{{ m.sender.username }}</p>
											<p class="text-xs text-text-third hover:underline" v-if="m.sender.username.length > 10">
												{{ m.sender.username.slice(0, 9) + "..." }}</p>
										</RouterLink>
									</div>
								</div>
							</div>
						</div>
						<div v-if="!msgStore.msgRecevied.size" class="flex p-2 my-2 rounded-sm text-text-default">
							<p class="mx-auto">{{ t('header.zeroNotif') }}</p>
						</div>
					</div>	
				</Transition>
			</div>

			<div class="relative w-fit" ref="p_dropdown">
				<button
					class="flex items-center cursor-pointer mr-1"
					@click="p_bool = !p_bool"
					:aria-expanded="p_bool"
					aria-haspopup="true">
					<h2 v-if="user.username.length > 11" class="text-text-default place-self-center
						max-md:text-sm
						max-lg:mr-1.5 md:text-lg
						lg:hidden">{{ user.username.slice(0, 10) + "..."}}</h2>
					<h2 v-if="user.username.length <= 11" class="text-text-default place-self-center
						max-md:text-sm
						max-lg:mr-1.5 md:text-lg
						lg:hidden">{{ user.username }}</h2>
					<h2 class="text-text-default place-self-center mr-2 max-lg:hidden">{{ user.username }}</h2>
					<UserAvatar
						:src="user.image"
						class="rounded-full place-self-center mr-1 object-cover max-md:size-10 md:size-11 lg:size-12" />
					<IconChevron class="size-4 text-text-default transition-transform duration-200 max-lg:hidden" :class="{ 'rotate-180': p_bool }"/>
				</button>
				<Transition
					class="origin-top-right"
					enter-active-class="transition ease-out duration-150"
					enter-from-class="opacity-0 scale-70"
					enter-to-class="opacity-100 scale-100"
					leave-active-class="transition ease-in duration-100"
					leave-from-class="opacity-100 scale-100"
					leave-to-class="opacity-0 scale-70">
					<div v-if="p_bool" class="mt-1.25 p-2 absolute right-0 bg-bg-darker origin-top border border-border-second min-w-full
												max-md:text-sm max-lg:text-lg">
						<RouterLink to="/me" @click="p_bool = false">
							<p class="text-text-default hover:underline">{{ t('header.profile') }}</p>
						</RouterLink>
						<hr class="w-full justify-self-start text-text-last">
						<RouterLink to="/me/edit" @click="p_bool = false">
							<p class="text-text-default hover:underline">{{ t('header.settings') }}</p>
						</RouterLink>
						<hr class="w-full justify-self-start text-text-last">
						<div class="relative" ref="l_dropdown">
							<button
								type="button"
								class="flex w-full items-center justify-between gap-3 text-text-default hover:underline"
								@click="l_bool = !l_bool"
								:aria-expanded="l_bool"
								aria-haspopup="listbox">
								<span>{{ locale === 'it' ? 'Italiano' : 'English' }}</span>
								<IconChevron class="size-3 transition-transform duration-200" :class="{ 'rotate-180': l_bool }"/>
							</button>
							<Transition
								class="origin-top-right"
								enter-active-class="transition ease-out duration-150"
								enter-from-class="opacity-0 scale-70"
								enter-to-class="opacity-100 scale-100"
								leave-active-class="transition ease-in duration-100"
								leave-from-class="opacity-100 scale-100"
								leave-to-class="opacity-0 scale-70">
								<div v-if="l_bool" class="absolute right-full top-0 mr-2 min-w-28 rounded-md border border-border-second bg-bg-darker p-1 shadow-lg">
									<button type="button" class="block w-full rounded px-3 py-1.5 text-left text-text-default hover:bg-bg-default" @click="locale = 'en'; l_bool = false">English</button>
									<button type="button" class="block w-full rounded px-3 py-1.5 text-left text-text-default hover:bg-bg-default" @click="locale = 'it'; l_bool = false">Italiano</button>
								</div>
							</Transition>
						</div>
						<hr class="w-full justify-self-start text-text-last">
						<button @click="submitForm(); p_bool = false" class="cursor-pointer text-text-default hover:underline">
							{{ t('header.logout') }}
						</button>
					</div>
				</Transition>
			</div>
		</div>
 
		<div v-if="user === null" class="justify-self-end place-self-center">
			<RouterLink to="/login" class="flex mr-3">
				<button class="flex cursor-pointer w-25 justify-center p-2 text-base bg-main-color rounded-[7px] text-text-default
								hover:bg-linear-to-t from-main-color to-light-button">{{ t('header.login') }}</button>
			</RouterLink>
		</div>
	</div>

	<div v-if="popUp && tourOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-bg-blur backdrop-blur-xs px-4" @click.self="closePopup()">
        <div class="w-full max-w-md rounded-3xl border border-border-default bg-bg-default p-6 text-text-default shadow-2xl">
            <div class="flex items-start justify-between gap-4">
                <div>
                    <p class="text-sm uppercase tracking-widest text-text-tour-friend">{{ t('common.tournament', 1) }}</p>
                    <div class="flex items-center justify-start gap-2 mt-1">
                        <RouterLink to="/tournaments" class="hover:underline">
                            <h3 class="text-2xl">{{ tourOpen.name }}</h3>
                        </RouterLink>
                        <p class="text-text-last">|</p>
                        <h4 :class="{	'text-text-win-open' : tourOpen.status === 'open',
										'text-text-draw-await' : tourOpen.status === 'ongoing',
										'text-text-lose-closed' : tourOpen.status === 'closed' }">
							{{ tourOpen.status }}
						</h4>
                    </div>
                    <hr class="w-[110%] justify-self-start text-text-last my-1">
                    <p class="text-sm text-text-second ml-1">{{ t('header.inv.creation', {date: rework_date(tourOpen.created_at)}) }}
                        <RouterLink :to="{ name: 'user_page', params: { username: tourOpen.created_by.username } }" class="hover:underline">
                            {{ tourOpen.created_by.username }}
                        </RouterLink>
                    </p>
                </div>
                <button type="button" class="text-2xl leading-none text-text-third hover:text-text-default" @click="closePopup()">&times;</button>
            </div>
            <div class="mt-6 mb-3 flex flex-col gap-2 justify-self-center items-center text-center">
				<p v-html="$t('header.inv.desc', {tourName: tourOpen.name, tourCreator: tourOpen.created_by.username})"></p>
				<div v-if="tourOpen.status == 'open'" class="flex gap-10 w-max justify-self-end-safe pt-5">
					<button class="cursor-pointer rounded-md inset-ring text-lg px-3 p-2.5
								bg-bg-accept text-online-accept inset-ring-inset-accept"
						@click="accpetInvite()">
						<p>{{ t('common.accept') }}</p>
					</button>
					<button class="cursor-pointer rounded-md inset-ring text-lg px-3 p-2.5
									bg-bg-reject text-text-lose-closed inset-ring-inset-reject"
							@click="rejectInvite(); closePopup()">
						<p>{{ t('common.reject') }}</p>
					</button>
				</div>
				<div v-if="tourOpen.status != 'open'" class="flex gap-3 rounded-xl border p-5 mt-4 w-full justify-center
						animate-card inset-ring bg-bg-error text-text-error border-border-error inset-ring-inset-error">
					<IconSmile class="size-6"/>
					<h2>{{ t('header.inv.expired') }}</h2>
				</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
	h1 {
		font-family: "Copperplate", Times;
	}

	input:focus {
		outline: 0;
	}

	input[type="search"]::-webkit-search-cancel-button {
	    -webkit-appearance: none;
	    cursor: pointer;
	    background-image: url(" ### Inline SVG of Choice ### ");
	}

	input::-webkit-calendar-picker-indicator {
		display: none !important;
	}
</style>