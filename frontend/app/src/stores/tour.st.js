import { useSockStore } from './sock.st';
import { defineStore }  from 'pinia';

export const useTourStore = defineStore('tour', {
	state: () => ({
		pwd: null,
		id : null,
        status: null,
        error: null
	}),

	actions: 
	{
        async createTour(tourName)
		{
            const socket = useSockStore().socket;
			try{
				const resp = await socket.emitWithAck("create_tournament", {name: tourName});
				if (resp.msg == "OK")
				{
					this.pwd = resp.tournament_pwd;
					this.id = resp.tournament_id;
				}
				return (true);
			}
			catch(error) {
				this.error = error;
				return (false);
			}
		},
		async enterTour(pwd)
		{
			const socket = useSockStore().socket;
			try{
				const resp = await socket.emitWithAck("join_tournament", {tournament_pwd: pwd});
				if (resp.msg == "OK")
				{ return (true); }
			}
			catch(error) {
				this.error = error;
				return (false);
			}
		}
	}
})