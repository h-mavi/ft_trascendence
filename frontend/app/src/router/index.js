import { createRouter, createWebHistory }	from 'vue-router'
import { useAuthStore }						from '@/stores/auth.st'
import TermsOfService 						from '../views/TermsOfService.vue'
import RegisterPage 						from '../views/RegisterPage.vue'
import ClassicGame 							from '../views/ClassicGame.vue'
import LeaderBoard 							from '../views/LeaderBoard.vue'
import PrivacyPage 							from '../views/PrivacyPage.vue'
import UserOther 							from '../views/UserOther.vue'
import UsersList 							from '../views/UsersList.vue'
import LoginPage 							from '../views/LoginPage.vue'
import ChangePwd 							from '../views/ChangePwd.vue'
import CodexPage 							from '../views/CodexPage.vue'
import EditPage 							from '../views/EditPage.vue'
import PlayPage 							from '../views/PlayPage.vue'
import UserMe 								from '../views/UserMe.vue'
import Home 								from '../views/Home.vue'
import { api, ApiError }					from './api/client'
// import GameFour 							from '../views/GameFour.vue'
// import PwdDEBUG 							from '../views/PwdDEBUG.vue'
// import StartTour 							from '../views/StartTour.vue'
// import OpenTournament 						from '../views/OpenTournament.vue'
// import TournamentPage 						from '../views/TournamentPage.vue'
// import { ePlaying, localMatchState }		from '@/scripts/Data/Variables.js'
// import { amIPlaying } 						from '@/scripts/Events/BackLink.js'

const routes = [
	{
		path: '/',
		name: 'home',
		component: Home
	},
	{
		path: '/privacy',
		name: 'privacy',
		component: PrivacyPage
	},
	{
		path: '/terms',
		name: 'terms',
		component: TermsOfService
	},
	{
		path: '/game',
		name: 'game',
		meta: { requiresAuth: true },
		component: ClassicGame
	},
	{
		path: '/playpage',
		name: 'playpage',
		meta: { requiresAuth: true },
		component: PlayPage
	},
	{
		path: '/leaderboard',
		name: 'Leaderboard',
		meta: { requiresAuth: true },
		component: LeaderBoard
	},
	{
		path: '/codex',
		name: 'Codex',
		component: CodexPage
	},
	{
		path: '/login',
		name: 'log',
		meta: { requiresGuest: true },
		component: LoginPage
	},
	{
		path: '/register',
		name: 'register',
		meta: { requiresGuest: true },
		component: RegisterPage
	},
	{
		path: `/me`,
		name: 'me_page',
		meta: { requiresAuth: true },
		component: UserMe
	},
	{
		path: `/me/edit`,
		name: 'edit',
		meta: { requiresAuth: true },
		component: EditPage
	},
	{
		path: `/me/edit/pwd`,
		name: 'edit_pwd',
		meta: { requiresAuth: true },
		component: ChangePwd
	},
	{
		path: '/users/:query?',
		name: 'users_list',
		component: UsersList,
		meta: { requiresAuth: true },
		props: (route) => ({ query: route.params.query ? String(route.params.query) : '' })
	},
	{
	    path: '/:username?',
	    name: 'user_page',
	    component: UserOther,
	    meta: { requiresAuth: true },
	    props: (route) => ({ username: String(route.params.username) }),
	    beforeEnter: async (to) => {
	        try {
	            await api.get(
	                `/api/users/username/${encodeURIComponent(to.params.username)}`
	            );

	            return true;
	        }
	        catch (error) {
	            if (error instanceof ApiError && error.status === 404) {
	                return { name: 'home', replace: true };
	            }

	            throw error;
	        }
	    }
	},
	{
        path: '/:pathMatch(.*)*',
        name: 'not_found',
        redirect: '/'
    },
	// {
	// 	path: '/4v4_game',
	// 	name: 'GameFour',
	// 	meta: { requiresAuth: true },
	// 	component: GameFour
	// },
	// {
	// 	path: `/DEBUG/pwd`,
	// 	name: 'DEBUG_pwd',
	// 	meta: { requiresGuest: true },
	// 	component: PwdDEBUG
	// },
	// {
	// 	path: '/tournaments',
	// 	name: 'Tournaments',
	// 	meta: { requiresAuth: true },
	// 	component: TournamentPage
	// },
	// {
	// 	path: '/tournament/:tournament?',
	// 	name: 'open_tournament',
	// 	component: OpenTournament,
	// 	meta: { requiresAuth: true },
	// 	beforeEnter: async (to) => {
	// 		const id = Number(to.params.tournament);

	// 		if (!Number.isInteger(id) || id <= 0) { return { name: 'Tournaments' }; }

	// 		try { if (await api.get(`/api/tournaments/${id}`)) { return true; } }
	// 		catch { return { name: 'Tournaments' }; }
	// 	},
	// 	props: (route) => ({ tournament: Number(route.params.tournament) })
	// },
	// {
	// 	path: '/tournament/:tournament?/tree',
	// 	name: 'start_tournament',
	// 	component: StartTour,
	// 	meta: { requiresAuth: true },
	// 	beforeEnter: async (to) => {
	// 		const id = Number(to.params.tournament);

	// 		if (!Number.isInteger(id) || id <= 0) { return { name: 'Tournaments' }; }

	// 		try { if (await api.get(`/api/tournaments/${id}`)) { return true; } }
	// 		catch { return { name: 'Tournaments' }; }
	// 	},
	// 	props: (route) => ({ tournament: Number(route.params.tournament) })
	// }
];

const router = createRouter({
	history: createWebHistory(),
	routes,
})

router.beforeEach(async (to) => {
	const authStore = useAuthStore();

	if (!authStore.sessionChecked) { await authStore.fetchMe(); }

	if (to.meta.requiresAuth && !authStore.isAuthenticated)
		return ({ name: 'log' });

	if (to.meta.requiresGuest && authStore.isAuthenticated)
		return ({ name: 'home' });
})

export default router
