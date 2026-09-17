import { useAuthStore }		from './auth.st';
import { defineStore }		from 'pinia';
import { taskApi }			from '../router/api/task.api';

export const useMsgStore = defineStore('msg', {
	state: () => ({
		msgRecevied: new Set(),
		error: null
	}),

	actions: 
	{
		async getMsg()
		{
			try {
				const	resp = await taskApi.msglist(),
						messages = Array.from(resp).sort((a, b) => {
        		    const 	unreadA = a.status === "not_read",
        		    		unreadB = b.status === "not_read";
				
        		    if (unreadA !== unreadB) { return unreadB - unreadA; }

        		    return new Date(b.creation_date) - new Date(a.creation_date);
        		}).slice(0, 10);
				
        		this.msgRecevied.clear();
        		messages.forEach(message => this.msgRecevied.add(message));
			}
			catch (err) { this.error = err.message; }
		},

        async add(msg) {
			await useAuthStore().fetchMe(true);
			
			//if (msg.title == "N") { return (useAuthStore().fetchMe(true)); }

            //msg.status = "not_read";
			//const messages = [ msg, ...this.msgRecevied ].slice(0, 10); //ricreo il set da zero per mettere l'ultimo messaggio in cima
    		//this.msgRecevied = new Set(messages);
		},

		clear() { this.msgRecevied.clear(); }
	}
})