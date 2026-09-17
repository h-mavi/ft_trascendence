import { api } from './client'

export const taskApi = {
	friendlist:	async () => {
		const resp = await api.get('/api/friends'); // lista di amici
		return (resp.data.friendship);
	},
	matchlist: async () => {
		const resp = await api.get('/api/matchesHistory'); // lista degli incontri
		return (resp.data.matches);
	},
	msglist:	async () => {
		const resp = await api.get('/api/notifications'); // lista delle notifiche
		return (resp.data.notifications);
	},
	tournament:	async () => {
		const resp = await api.get('/api/tournaments'); // lista degli tornei
		return (resp.data.tournaments);
	}
}